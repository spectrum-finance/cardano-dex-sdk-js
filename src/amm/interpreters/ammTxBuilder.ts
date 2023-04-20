import {Transaction} from "@emurgo/cardano-serialization-lib-nodejs"
import {Addr} from "../../cardano/entities/address"
import {AdaEntry} from "../../cardano/entities/assetEntry"
import {PubKeyHash} from "../../cardano/entities/publicKey"
import {stakeKeyHashFromAddr} from "../../cardano/entities/stakeKey"
import {TxCandidate} from "../../cardano/entities/tx"
import {TxOutCandidate} from "../../cardano/entities/txOut"
import {add, getLovelace, Value} from "../../cardano/entities/value"
import {Lovelace} from "../../cardano/types"
import {InputSelector} from "../../cardano/wallet/inputSelector"
import {TxAsm} from "../../cardano/wallet/txAsm"
import {TxMath} from "../../cardano/wallet/txMath"
import {AssetAmount} from "../../domain/assetAmount"
import {CardanoWasm} from "../../utils/rustLoader"
import {AmmPool} from "../domain/ammPool"
import {FeePerToken} from "../domain/models"
import {AmmTxFeeMapping} from "../math/order"
import {SwapExtremums, swapVars} from "../math/swap"
import {OrderKind} from "../models/opRequests"
import {AmmActions} from "./ammActions"
import {AmmOutputs} from "./ammOutputs"

export interface TxInfo {
  readonly txFee: bigint;
  readonly minExFee: bigint;
  readonly maxExFee: bigint;
  readonly refundableDeposit: bigint;
  readonly minOutput: AssetAmount;
  readonly maxOutput: AssetAmount;
  readonly orderBudget: Value;
  readonly orderValue: Value;
}

export interface SwapParams {
  readonly base: AssetAmount;
  readonly quote: AssetAmount;
  readonly pool: AmmPool;
  readonly slippage: number;
  readonly nitro: number;
  readonly txFees: AmmTxFeeMapping;
  readonly minExecutorReward: Lovelace;
  readonly changeAddress: Addr;
  readonly pk: PubKeyHash;
}

export interface AmmTxBuilder {
  swap(params: SwapParams): Promise<[Transaction, TxCandidate, TxInfo]>;
}

class SwapAmmTxBuilder {
  constructor(
    private txMath: TxMath,
    private ammOutputs: AmmOutputs,
    private ammActions: AmmActions,
    private inputSelector: InputSelector,
    private R: CardanoWasm
  ) {
  }

  async build(params: SwapParams, userTxFee?: bigint): Promise<[TxCandidate, TxInfo]> {
    const {txFees, minExecutorReward, nitro, quote, base, changeAddress} = params
    const vars = swapVars(txFees, minExecutorReward, nitro, quote)

    if (!vars) {
      throw new Error("amount is equals zero")
    }
    const [exFeePerToken, extremums] = vars

    const data = this.getSwapOrderValue(
      base,
      extremums.maxExFee,
      extremums.maxOutput,
      changeAddress
    )
    const orderValue = add(data[0], AdaEntry(userTxFee || txFees.swapOrder))

    const [orderBudget, refundableBugdetPart] = this.getSwapOrderBudget(
      orderValue,
      params,
      exFeePerToken,
      extremums
    )
    const txInfo: TxInfo = {
      minExFee:          extremums.minExFee,
      maxExFee:          extremums.maxExFee,
      minOutput:         extremums.minOutput,
      maxOutput:         extremums.maxOutput,
      orderValue:        orderValue,
      orderBudget:       orderBudget,
      refundableDeposit: data[1] + refundableBugdetPart,
      txFee:             userTxFee || txFees.swapOrder
    }


    const inputs = await this.inputSelector.select(orderBudget)

    if (inputs instanceof Error) {
      throw new Error("insufficient funds")
    }

    return [this.ammActions.createOrder({
      kind:           OrderKind.Swap,
      poolId:         params.pool.id,
      rewardPkh:      params.pk,
      stakePkh:       stakeKeyHashFromAddr(
        params.changeAddress,
        this.R
      ),
      poolFeeNum:     params.pool.poolFeeNum,
      baseInput:      params.base,
      quoteAsset:     params.quote.asset,
      minQuoteOutput: extremums.minOutput.amount,
      uiFee:          0n,
      exFeePerToken:  exFeePerToken,
      orderValue:     orderValue
    }, {
      changeAddr:       params.changeAddress,
      collateralInputs: [],
      inputs:           inputs
    }), txInfo]
  }

  private getSwapOrderBudget(
    orderValue: Value,
    params: SwapParams,
    exFeePerToken: FeePerToken,
    extremums: SwapExtremums
  ): [Value, bigint] {
    const estimatedOutput = this
      .ammOutputs
      .swap({
        kind:           OrderKind.Swap,
        poolId:         params.pool.id,
        rewardPkh:      params.pk,
        stakePkh:       stakeKeyHashFromAddr(
          params.changeAddress,
          this.R
        ),
        poolFeeNum:     params.pool.poolFeeNum,
        baseInput:      params.base,
        quoteAsset:     params.quote.asset,
        minQuoteOutput: extremums.minOutput.amount,
        uiFee:          0n,
        exFeePerToken:  exFeePerToken,
        orderValue:     orderValue
      })
    const requiredAdaForOutput = this.txMath.minAdaRequiredforOutput(estimatedOutput)
    const lovelace = getLovelace(orderValue)

    return lovelace.amount >= requiredAdaForOutput ?
      [orderValue, 0n] :
      [
        add(orderValue, AdaEntry(requiredAdaForOutput - lovelace.amount)),
        requiredAdaForOutput - lovelace.amount
      ]
  }

  private getSwapOrderValue(
    input: AssetAmount,
    maxExFee: Lovelace,
    maxOutput: AssetAmount,
    addr: Addr
  ): [Value, bigint] {
    const estimatedExecutorOutTxCandidate: TxOutCandidate = {
      value: Value(0n, maxOutput),
      addr
    }
    const requiredAdaForOutput = this.txMath.minAdaRequiredforOutput(estimatedExecutorOutTxCandidate)

    if (!maxOutput.isAda) {
      return [
        add(add(Value(requiredAdaForOutput), input.toEntry), AdaEntry(maxExFee)),
        requiredAdaForOutput
      ]
    }
    if (maxOutput.amount >= requiredAdaForOutput) {
      return [add(Value(maxExFee), input.toEntry), 0n]
    }
    return [
      add(add(Value(requiredAdaForOutput - maxOutput.amount), input.toEntry), AdaEntry(maxExFee)),
      requiredAdaForOutput - maxOutput.amount
    ]
  }
}

export class DefaultAmmTxCandidateBuilder implements AmmTxBuilder {
  private swapAmmTxBuilder: SwapAmmTxBuilder

  constructor(txMath: TxMath,
              ammOuptuts: AmmOutputs,
              ammActions: AmmActions,
              inputSelector: InputSelector,
              R: CardanoWasm,
              private txAsm: TxAsm) {
    this.swapAmmTxBuilder = new SwapAmmTxBuilder(txMath, ammOuptuts, ammActions, inputSelector, R)
  }

  async swap(swapParams: SwapParams): Promise<[Transaction, TxCandidate, TxInfo]> {
    const [swapTxCandidate] = await this.swapAmmTxBuilder.build(swapParams)
    const transaction = this.txAsm.finalize(swapTxCandidate)

    const txFee = BigInt(transaction.body().fee().to_str())

    const [normalizedSwapTxCandidate, normalizedSwapTxInfo] = await this
      .swapAmmTxBuilder
      .build(swapParams, txFee)
    const normalizedTransaction = this.txAsm.finalize(normalizedSwapTxCandidate)

    return [normalizedTransaction, normalizedSwapTxCandidate, normalizedSwapTxInfo]
  }
}
