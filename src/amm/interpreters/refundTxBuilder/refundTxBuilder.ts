import {Transaction} from "@emurgo/cardano-serialization-lib-nodejs"
import {AdaAssetName, AdaPolicyId} from "../../../cardano/constants"
import {extractPaymentCred} from "../../../cardano/entities/address"
import {AdaEntry} from "../../../cardano/entities/assetEntry"
import {ProtocolParams} from "../../../cardano/entities/env"
import {TxCandidate} from "../../../cardano/entities/tx"
import {FullTxIn} from "../../../cardano/entities/txIn"
import {TxOutCandidate} from "../../../cardano/entities/txOut"
import {getLovelace, sum} from "../../../cardano/entities/value"
import {Datum, HexString} from "../../../cardano/types"
import {CollateralSelector} from "../../../cardano/wallet/collateralSelector"
import {InputSelector} from "../../../cardano/wallet/inputSelector"
import {TxAsm} from "../../../cardano/wallet/txAsm"
import {TxMath} from "../../../cardano/wallet/txMath"
import {CardanoNetwork} from "../../../quickblue/cardanoNetwork"
import {QuickblueTx, QuickblueTxOut} from "../../../quickblue/models"
import {CardanoWasm} from "../../../utils/rustLoader"
import {parseDepositConfig, parseRedeemConfig, parseSwapConfig} from "../../contractData"
import {datumRewardPKHIndex, OpInRef} from "../../scripts"

const FEE_REGEX = /fee (\d+)/

const DEFAULT_REFUND_FEE = 2000000n

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

export const DEFAULT_EX_UNITS_MEM = "10000000"
export const DEFAULT_EX_UNITS_STEPS = "9000000000"

export interface ExUnitsDescriptor {
  readonly mem: string;
  readonly steps: string;
}

export interface ExUnitsCalculator {
  calculateExUnits: (tx: QuickblueTx, outToRefund: QuickblueTxOut) => Promise<ExUnitsDescriptor>
}

export type PKHParser = (datum: Datum, R: CardanoWasm) => [HexString, HexString | undefined] | undefined

export const depositParser: PKHParser = (datum, R: CardanoWasm) => {
  const parsedDatum = parseDepositConfig(datum, R);

  return parsedDatum ? [parsedDatum.rewardPkh, parsedDatum.stakePkh] : undefined;
}

export const swapParser: PKHParser = (datum, R: CardanoWasm) => {
  const parsedDatum = parseSwapConfig(datum, R);

  return parsedDatum ? [parsedDatum.rewardPkh, parsedDatum.stakePkh] : undefined;
}

export const redeemParser: PKHParser = (datum, R: CardanoWasm) => {
  const parsedDatum = parseRedeemConfig(datum, R);

  return parsedDatum ? [parsedDatum.rewardPkh, parsedDatum.stakePkh] : undefined;
}

export interface RefundParams {
  readonly collateralAmount?: bigint;
  readonly txId: string
  readonly recipientAddress: string
}

const MAX_TRANSACTION_BUILDING_TRY_COUNT = 3

export class RefundTxBuilder {
  private addressesToRefund: HexString[]

  private mapRefundAddressToScript: {[key: string]: HexString}

  private mapRefundAddressToOpInRef: {[key: string]: OpInRef}

  private mapRefundAddressToDatumRewardPKHIdex: {[key: string]: number}

  private mapRefundAddressToDatumPkhParser: {[key: string]: PKHParser}

  constructor(private params: RefundTxBuilderParams,
              private inputSelector: InputSelector,
              private collateralSelector: CollateralSelector,
              private R: CardanoWasm,
              private txMath: TxMath,
              private txAsm: TxAsm,
              private pparams: ProtocolParams,
              private network: CardanoNetwork,
              private exUnitsCalculator: ExUnitsCalculator) {
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
    this.mapRefundAddressToDatumRewardPKHIdex = {
      [this.params.deposit.address]: datumRewardPKHIndex.ammDeposit,
      [this.params.swap.address]:    datumRewardPKHIndex.ammSwap,
      [this.params.redeem.address]:  datumRewardPKHIndex.ammRedeem
    }
    this.mapRefundAddressToDatumPkhParser = {
      [this.params.deposit.address]: depositParser,
      [this.params.swap.address]:    swapParser,
      [this.params.redeem.address]:  redeemParser
    }
  }

  async refund(
    params: RefundParams,
    currentTry = 1,
    bestTransaction?: Transaction | null,
    prevTxFee?: bigint
  ): Promise<[TxCandidate, Transaction | null, Error | null]> {
    if (currentTry >= MAX_TRANSACTION_BUILDING_TRY_COUNT && bestTransaction) {
      const refundTxCandidate: TxCandidate = await this
        .buildRefundTxCandidate(params, BigInt(bestTransaction.body().fee().to_str()))

      return [refundTxCandidate, bestTransaction, null]
    }

    const refundTxCandidate = await this.buildRefundTxCandidate(params, prevTxFee)

    try {
      const transaction = this.txAsm.finalize(refundTxCandidate)
      const txFee = BigInt(transaction.body().fee().to_str())

      if (prevTxFee === txFee) {
        return [refundTxCandidate, transaction, null]
      } else {
        const newBestTxData: Transaction | null | undefined = !!prevTxFee && txFee < prevTxFee ?
          transaction :
          bestTransaction

        return this.refund(params, currentTry + 1, newBestTxData, txFee)
      }
    } catch (e) {
      console.warn(e, typeof e, FEE_REGEX.test(e))

      if (typeof e === "string" && FEE_REGEX.test(e)) {
        console.log(e, "fee_regex")
        return this.refund(params, currentTry + 1, bestTransaction, this.getFeeFromError(e))
      }
      return [refundTxCandidate, null, e]
    }
  }

  private getFeeFromError(e: string): bigint {
    const normalFee = e.match(FEE_REGEX)?.[1]

    return normalFee ? BigInt(Math.floor(Number(normalFee) * 1.05)) : DEFAULT_REFUND_FEE
  }

  private async buildRefundTxCandidate(params: RefundParams, fee = 0n): Promise<TxCandidate> {
    const tx = await this.network.getTx(params.txId)
    if (!tx) {
      return Promise.reject(`No AMM orders found in the given Tx{id=${params.txId}`)
    }

    let outputToRefund = tx?.outputs.find(o => this.addressesToRefund.includes(o.addr))
    if (!outputToRefund) {
      return Promise.reject(`No refundable outputs in Tx{id=${params.txId}`)
    }
    outputToRefund = {
      ...outputToRefund,
      value: outputToRefund.value.map(item => ({
        ...item,
        nameHex: this.R.AssetName.new(new TextEncoder().encode(item.name)).to_hex()
      }))
    }

    const rewardPKHDatumIndex = this.mapRefundAddressToDatumRewardPKHIdex[outputToRefund.addr]
    const rewardPKH = outputToRefund.data?.fields[rewardPKHDatumIndex].bytes

    const collateral = await this
      .collateralSelector
      .getCollateral(params.collateralAmount || this.params.defaultCollateralAmount)
    if (!collateral) {
      return Promise.reject(`User has no collateral inputs`)
    }
    if (collateral.length > this.pparams.maxCollateralInputs) {
      return Promise.reject(`Too many collateral inputs`)
    }

    let exUnits: ExUnitsDescriptor

    try {
      exUnits = await this.exUnitsCalculator.calculateExUnits(tx, outputToRefund)
    } catch {
      exUnits = {mem: DEFAULT_EX_UNITS_MEM, steps: DEFAULT_EX_UNITS_STEPS}
    }

    const input: FullTxIn = {
      txOut:         outputToRefund,
      consumeScript: {
        validator: this.mapRefundAddressToScript[outputToRefund.addr],
        redeemer:  "d8799f00000001ff",
        datum:     outputToRefund.dataBin,
        opInRef:   this.mapRefundAddressToOpInRef[outputToRefund.addr],
        mem:       exUnits.mem || DEFAULT_EX_UNITS_MEM,
        steps:     exUnits.steps || DEFAULT_EX_UNITS_STEPS
      }
    }

    let rewardAddress: string

    if (rewardPKH === extractPaymentCred(params.recipientAddress, this.R)) {
      rewardAddress = params.recipientAddress
    } else {
      const rewardAddrData = this.mapRefundAddressToDatumPkhParser[outputToRefund.addr](outputToRefund.dataBin!, this.R);

      if (!rewardAddrData) {
        throw new Error('no valid reward data');
      }
      const paymentCredential = this.R.StakeCredential
        .from_keyhash(this.R.Ed25519KeyHash.from_hex(rewardAddrData[0]));
      const stakeCredential =  rewardAddrData[1] ?
        this.R.StakeCredential.from_keyhash(this.R.Ed25519KeyHash.from_hex(rewardAddrData[1])) :
        undefined;
      const addr = stakeCredential ?
        this.R.BaseAddress.new(this.R.NetworkIdKind.Mainnet, paymentCredential, stakeCredential) :
        this.R.EnterpriseAddress.new(this.R.NetworkIdKind.Mainnet, paymentCredential);

      rewardAddress = addr.to_address().to_bech32();
    }

    const refundOut: TxOutCandidate = {
      addr:  rewardAddress,
      value: outputToRefund.value.map(item => ({...item, quantity: BigInt(item.quantity)}))
    }
    const outputAdaWithoutFee = getLovelace(refundOut.value).amount - fee
    const minAdaRequired = this.txMath.minAdaRequiredforOutput(refundOut)

    if (minAdaRequired > outputAdaWithoutFee) {
      return this.buildCandidateWithUserInputs(params, rewardAddress, input, refundOut, collateral, fee, minAdaRequired, outputAdaWithoutFee, rewardPKH)
    } else {
      return Promise.resolve(this.buildCandidateWithoutUserInputs(params, rewardAddress, input, refundOut, collateral, fee, rewardPKH))
    }
  }

  private async buildCandidateWithUserInputs(
    params: RefundParams,
    rewardAddress: string,
    refundInput: FullTxIn,
    refundOutput: TxOutCandidate,
    collateral: FullTxIn[],
    fee: bigint,
    minAdaRequired: bigint,
    outputAdaWithoutFee: bigint,
    requiredSigner: string
  ): Promise<TxCandidate> {
    const adaDiff = minAdaRequired - outputAdaWithoutFee

    if (adaDiff <= 0) {
      return Promise.resolve(this.buildCandidateWithoutUserInputs(params, rewardAddress, refundInput, refundOutput, collateral, fee, requiredSigner))
    }

    let inputs: FullTxIn[] | Error

    try {
      inputs = await this.inputSelector.select([AdaEntry(adaDiff)])
    } catch (e) {
      return Promise.reject("insufficient balance for refund")
    }

    if (inputs instanceof Error) {
      return Promise.reject("insufficient balance for refund")
    }

    const outputValue = sum([...inputs.map(item => item.txOut.value), refundOutput.value])
    const normalizedRefundOutput: TxOutCandidate = {
      addr:  refundOutput.addr,
      value: outputValue.map(item => item.policyId === AdaPolicyId && item.name === AdaAssetName ?
        ({...item, quantity: item.quantity - fee}) : item
      )
    }

    return {
      inputs:     [refundInput, ...inputs],
      outputs:    [normalizedRefundOutput],
      changeAddr: rewardAddress,
      collateral: collateral,
      requiredSigner
    }
  }

  private buildCandidateWithoutUserInputs(
    params: RefundParams,
    rewardAddress: string,
    refundInput: FullTxIn,
    refundOutput: TxOutCandidate,
    collateral: FullTxIn[],
    fee: bigint,
    requiredSigner: string
  ): TxCandidate {
    console.log(params)
    const normalizedRefundOutput: TxOutCandidate = {
      addr:  refundOutput.addr,
      value: refundOutput.value.map(item => item.policyId === AdaPolicyId && item.name === AdaAssetName ?
        ({...item, quantity: item.quantity - fee}) : item
      )
    }

    return {
      inputs:     [refundInput],
      outputs:    [normalizedRefundOutput],
      changeAddr: rewardAddress,
      collateral: collateral,
      requiredSigner
    }
  }
}
