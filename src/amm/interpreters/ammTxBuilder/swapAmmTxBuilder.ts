import {Addr} from "../../../cardano/entities/address"
import {AdaEntry} from "../../../cardano/entities/assetEntry"
import {PubKeyHash} from "../../../cardano/entities/publicKey"
import {stakeKeyHashFromAddr} from "../../../cardano/entities/stakeKey"
import {TxCandidate} from "../../../cardano/entities/tx"
import {FullTxIn} from "../../../cardano/entities/txIn"
import {TxOutCandidate} from "../../../cardano/entities/txOut"
import {add, getLovelace, Value} from "../../../cardano/entities/value"
import {Lovelace} from "../../../cardano/types"
import {InputSelector} from "../../../cardano/wallet/inputSelector"
import {TxMath} from "../../../cardano/wallet/txMath"
import {AssetAmount} from "../../../domain/assetAmount"
import {CardanoWasm} from "../../../utils/rustLoader"
import {AmmPool} from "../../domain/ammPool"
import {FeePerToken} from "../../domain/models"
import {AmmTxFeeMapping} from "../../math/order"
import {SwapExtremums, swapVars} from "../../math/swap"
import {OrderKind} from "../../models/opRequests"
import {AmmActions} from "../ammActions"
import {AmmOutputs} from "../ammOutputs"
import {selectInputs} from "./selectInputs"

export interface SwapParams {
  readonly base: AssetAmount
  readonly quote: AssetAmount
  readonly pool: AmmPool
  readonly slippage: number
  readonly nitro: number
  readonly txFees: AmmTxFeeMapping
  readonly minExecutorReward: Lovelace
  readonly changeAddress: Addr
  readonly pk: PubKeyHash
}

export interface SwapTxInfo {
  readonly txFee: bigint | undefined;
  readonly minExFee: bigint
  readonly maxExFee: bigint
  readonly refundableDeposit: bigint
  readonly minOutput: AssetAmount
  readonly maxOutput: AssetAmount
  readonly orderBudget: Value
  readonly orderValue: Value
}

export class SwapAmmTxBuilder {
  constructor(
    private txMath: TxMath,
    private ammOutputs: AmmOutputs,
    private ammActions: AmmActions,
    private inputSelector: InputSelector,
    private R: CardanoWasm
  ) {}

  async build(params: SwapParams, allInputs: FullTxIn[], userTxFee?: bigint): Promise<[TxCandidate, SwapTxInfo, Error | undefined]> {
    const {txFees, minExecutorReward, nitro, quote, base, changeAddress} = params
    const vars = swapVars(txFees, minExecutorReward, nitro, quote)

    if (!vars) {
      throw new Error("amount is equals zero")
    }
    const [exFeePerToken, extremums] = vars

    const [rawOrderValue, refundableValuePart] = this.getSwapOrderValue(
      base,
      extremums.maxExFee,
      extremums.maxOutput,
      changeAddress
    )
    const [orderValue, refundableBugdetPart] = this.getSwapOrderBudget(
      rawOrderValue,
      params,
      exFeePerToken,
      extremums
    )
    const totalOrderBudget = add(orderValue, AdaEntry(userTxFee || txFees.swapOrder))

    const inputsOrError = await selectInputs(totalOrderBudget, changeAddress, this.inputSelector, allInputs, this.txMath);
    const inputs: FullTxIn[] = inputsOrError instanceof Error ? [] : inputsOrError;

    console.log(inputsOrError);
    const txInfo: SwapTxInfo = {
      minExFee: extremums.minExFee,
      maxExFee: extremums.maxExFee,
      minOutput: extremums.minOutput,
      maxOutput: extremums.maxOutput,
      orderValue: orderValue,
      orderBudget: totalOrderBudget,
      refundableDeposit: refundableValuePart + refundableBugdetPart,
      txFee: userTxFee || txFees.swapOrder
    }

    return [
      this.ammActions.createOrder(
        {
          kind: OrderKind.Swap,
          poolId: params.pool.id,
          rewardPkh: params.pk,
          stakePkh: stakeKeyHashFromAddr(params.changeAddress, this.R),
          poolFeeNum: Number(`9${params.pool.poolFeeNum}`),
          baseInput: params.base,
          quoteAsset: params.quote.asset,
          minQuoteOutput: extremums.minOutput.amount,
          uiFee: 0n,
          exFeePerToken: exFeePerToken,
          orderValue: orderValue
        },
        {
          changeAddr: params.changeAddress,
          collateralInputs: [],
          inputs: inputs
        }
      ),
      txInfo,
      inputsOrError instanceof Error ? inputsOrError : undefined
    ]
  }

  private getSwapOrderBudget(
    orderValue: Value,
    params: SwapParams,
    exFeePerToken: FeePerToken,
    extremums: SwapExtremums
  ): [Value, bigint] {
    const [estimatedOutput] = this.ammOutputs.swap({
      kind: OrderKind.Swap,
      poolId: params.pool.id,
      rewardPkh: params.pk,
      stakePkh: stakeKeyHashFromAddr(params.changeAddress, this.R),
      poolFeeNum: Number(`9${params.pool.poolFeeNum}`),
      baseInput: params.base,
      quoteAsset: params.quote.asset,
      minQuoteOutput: extremums.minOutput.amount,
      uiFee: 0n,
      exFeePerToken: exFeePerToken,
      orderValue: orderValue
    })
    const requiredAdaForOutput = this.txMath.minAdaRequiredforOutput(estimatedOutput)
    const lovelace = getLovelace(orderValue)

    return lovelace.amount >= requiredAdaForOutput
      ? [orderValue, 0n]
      : [
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
      return [add(add(Value(requiredAdaForOutput), input.toEntry), AdaEntry(maxExFee)), requiredAdaForOutput]
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
