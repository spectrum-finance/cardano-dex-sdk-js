import {Transaction} from "@emurgo/cardano-serialization-lib-nodejs"
import {AdaAssetName, AdaPolicyId} from "../../../cardano/constants"
import {AdaEntry} from "../../../cardano/entities/assetEntry"
import {ProtocolParams} from "../../../cardano/entities/env"
import {TxCandidate} from "../../../cardano/entities/tx"
import {FullTxIn} from "../../../cardano/entities/txIn"
import {TxOutCandidate} from "../../../cardano/entities/txOut"
import {emptyValue, getLovelace, sum} from "../../../cardano/entities/value"
import {HexString} from "../../../cardano/types"
import {CollateralSelector} from "../../../cardano/wallet/collateralSelector"
import {InputSelector} from "../../../cardano/wallet/inputSelector"
import {TxAsm} from "../../../cardano/wallet/txAsm"
import {TxMath} from "../../../cardano/wallet/txMath"
import {CardanoNetwork} from "../../../quickblue/cardanoNetwork"
import {OpInRef} from "../../scripts"

interface RefundTxBuilderParamsItem {
  readonly address: HexString;
  readonly script: HexString;
  readonly opInRef: OpInRef;
}

export interface RefundTxBuilderParams {
  readonly swap: RefundTxBuilderParamsItem;
  readonly deposit: RefundTxBuilderParamsItem;
  readonly redeem: RefundTxBuilderParamsItem;
  readonly defaultCollateralAmount: bigint;
}

export interface RefundParams {
  readonly collateralAmount?: bigint;
  readonly txId: string
  readonly recipientAddress: string
}

const DEFAULT_REFUND_FEE = 2000000n;

const MAX_TRANSACTION_BUILDING_TRY_COUNT = 3

export class RefundTxBuilder {
  private addressesToRefund: HexString[]

  private mapRefundAddressToScript: {[key: string]: HexString}

  private mapRefundAddressToOpInRef: {[key: string]: OpInRef}

  constructor(private params: RefundTxBuilderParams,
              private inputSelector: InputSelector,
              private collateralSelector: CollateralSelector,
              private txMath: TxMath,
              private txAsm: TxAsm,
              private pparams: ProtocolParams,
              private network: CardanoNetwork) {
    this.addressesToRefund = [
      this.params.deposit.address,
      this.params.swap.address,
      this.params.redeem.address
    ]
    this.mapRefundAddressToScript = {
      [this.params.deposit.address]: this.params.deposit.script,
      [this.params.swap.address]:    this.params.swap.script,
      [this.params.redeem.address]:  this.params.redeem.script
    }
    this.mapRefundAddressToOpInRef = {
      [this.params.deposit.address]: this.params.deposit.opInRef,
      [this.params.swap.address]:    this.params.swap.opInRef,
      [this.params.redeem.address]:  this.params.redeem.opInRef
    }
  }

  async refund(
    params: RefundParams,
    currentTry = 1,
    bestTransaction?: Transaction | null,
    prevTxFee?: bigint
  ): Promise<[TxCandidate, Transaction | null]> {
    if (currentTry >= MAX_TRANSACTION_BUILDING_TRY_COUNT && bestTransaction) {
      const refundTxCandidate: TxCandidate = await this
        .buildRefundTxCandidate(params, BigInt(bestTransaction.body().fee().to_str()))

      return [refundTxCandidate, bestTransaction]
    }

    const refundTxCandidate = await this.buildRefundTxCandidate(params, prevTxFee);

    try {
      const transaction = this.txAsm.finalize(refundTxCandidate);
      const txFee = BigInt(transaction.body().fee().to_str())

      if (prevTxFee === txFee) {
        return [refundTxCandidate, transaction]
      } else {
        const newBestTxData: Transaction | null | undefined = !!prevTxFee && txFee < prevTxFee ?
          transaction :
          bestTransaction

        return this.refund(params, currentTry + 1, newBestTxData, txFee)
      }
    } catch (e) {
      return [refundTxCandidate, null];
    }
  }

  private async buildRefundTxCandidate(params: RefundParams, fee: bigint = DEFAULT_REFUND_FEE): Promise<TxCandidate> {
    const tx = await this.network.getTx(params.txId)
    if (!tx) {
      return Promise.reject(`No AMM orders found in the given Tx{id=${params.txId}`)
    }

    const outputToRefund = tx?.outputs.find(o => this.addressesToRefund.includes(o.addr))
    if (!outputToRefund) {
      return Promise.reject(`No refundable outputs in Tx{id=${params.txId}`)
    }

    const collateral = await this
      .collateralSelector
      .getCollateral(params.collateralAmount || this.params.defaultCollateralAmount);
    if (!collateral) {
      return Promise.reject(`User has no collateral inputs`);
    }
    if (collateral.length > this.pparams.maxCollateralInputs) {
      return Promise.reject(`Too many collateral inputs`);
    }

    const input: FullTxIn = {
      txOut:         outputToRefund,
      consumeScript: {
        validator: this.mapRefundAddressToScript[outputToRefund.addr],
        redeemer:  "d8799f00000001ff",
        datum:     outputToRefund.dataBin,
        opInRef:   this.mapRefundAddressToOpInRef[outputToRefund.addr]
      }
    }
    const refundOut: TxOutCandidate = {
      addr:  params.recipientAddress,
      value: outputToRefund.value.map(item => ({ ...item, quantity: BigInt(item.quantity) }))
    }
    const outputAdaWithoutFee = getLovelace(refundOut.value).amount - fee;
    const minAdaRequired = this.txMath.minAdaRequiredforOutput(refundOut);

    if (minAdaRequired > outputAdaWithoutFee) {
      return this.buildCandidateWithUserInputs(params, input, refundOut, collateral, fee, minAdaRequired, outputAdaWithoutFee)
    } else {
      return Promise.resolve(this.buildCandidateWithoutUserInputs(params, input, refundOut, collateral, fee))
    }
  }

  private async buildCandidateWithUserInputs (
    params: RefundParams,
    refundInput: FullTxIn,
    refundOutput: TxOutCandidate,
    collateral: FullTxIn[],
    fee: bigint,
    minAdaRequired: bigint,
    outputAdaWithoutFee: bigint,
  ): Promise<TxCandidate> {
    const adaDiff = minAdaRequired - outputAdaWithoutFee;

    if (adaDiff <= 0) {
      return Promise.resolve(this.buildCandidateWithoutUserInputs(params, refundInput, refundOutput, collateral, fee));
    }
    const inputs = await this.inputSelector.select([AdaEntry(adaDiff)]);

    if (inputs instanceof Error) {
      return Promise.reject('insufficient balance for refund');
    }
    console.log(inputs, 'useInputs');
    const outputValue = sum(inputs.map(item => item.txOut.value).concat(refundOutput.value));
    const normalizedRefundOutput: TxOutCandidate = {
      addr:  refundOutput.addr,
      value: outputValue.map(item => item.policyId === AdaPolicyId && item.name === AdaAssetName ?
        ({...item, quantity: item.quantity - fee}) : item
      )
    }

    return {
      inputs:     [refundInput, ...inputs],
      outputs:    [normalizedRefundOutput],
      valueMint:  emptyValue,
      changeAddr: params.recipientAddress,
      collateral: collateral
    }
  }

  private buildCandidateWithoutUserInputs (
    params: RefundParams,
    refundInput: FullTxIn,
    refundOutput: TxOutCandidate,
    collateral: FullTxIn[],
    fee: bigint,
  ): TxCandidate {
    const normalizedRefundOutput: TxOutCandidate = {
      addr:  refundOutput.addr,
      value: refundOutput.value.map(item => item.policyId === AdaPolicyId && item.name === AdaAssetName ?
        ({...item, quantity: item.quantity - fee}) : item
      )
    }

    return {
      inputs:     [refundInput],
      outputs:    [normalizedRefundOutput],
      valueMint:  emptyValue,
      changeAddr: params.recipientAddress,
      collateral: collateral
    }
  }
}
