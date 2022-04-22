import {AdaEntry} from "../../cardano/entities/assetEntry"
import {add, Value} from "../../cardano/entities/value"
import {Lovelace} from "../../cardano/types"
import {TxMath} from "../../cardano/wallet/txMath"
import {AssetAmount} from "../../domain/assetAmount"
import {decimalToFractional} from "../../utils/math"
import {FeePerToken, feePerTokenFromDecimal} from "../domain/models"
import {OrderKind} from "../models/opRequests"
import {AmmTxFeeMapping, minExFeeForOrder} from "./order"

export type SwapExtremums = {
  minExFee: Lovelace
  maxExFee: Lovelace
  minOutput: AssetAmount
  maxOutput: AssetAmount
}

const I64Max = 9223372036854775807n

/** @param minExFee - minimal Execution fee
 *  @param nitro - minimal dex fee multiplier
 *  @param minOutput - minimal output expected
 *  @return DEX fee per token, swap extremums
 */
export function swapVars(
  minExFee: bigint,
  nitro: number,
  minOutput: AssetAmount
): [FeePerToken, SwapExtremums] | undefined {
  if (minOutput.amount > 0) {
    let exFeePerToken = Number(minExFee) / Number(minOutput.amount)
    while (true) {
      const [n, d] = decimalToFractional(exFeePerToken)
      if (n <= I64Max && d <= I64Max) break
      else {
        const feeStr = String(exFeePerToken)
        const idx = feeStr.indexOf(".")
        const decimalsNum = feeStr.slice(idx + 1).length
        exFeePerToken = Number(exFeePerToken.toFixed(decimalsNum - 1))
      }
    }
    const adjustedMinExFee = Math.floor(exFeePerToken * Number(minOutput.amount))
    const maxExFee = Math.floor(Number(minExFee) * nitro)
    const maxOutput = minOutput.withAmount(BigInt(Math.floor(maxExFee / exFeePerToken)))
    return [
      feePerTokenFromDecimal(exFeePerToken),
      {minExFee: BigInt(adjustedMinExFee), maxExFee: BigInt(maxExFee), minOutput, maxOutput}
    ]
  } else {
    return undefined
  }
}

export type SwapBudget = Value
export type SwapValue = Value

/** Estimate min Value required for Swap operation.
 *  Note: SwapBudget includes SwapValue
 *  @return [SwapBudget, SwapValue, FeePerToken, SwapExtremums]
 */
export function minBudgetForSwap(
  input: AssetAmount,
  minOutput: AssetAmount,
  nitro: number,
  fees: AmmTxFeeMapping,
  minExecutorReward: Lovelace,
  uiFee: Lovelace,
  txMath: TxMath
): [SwapBudget, SwapValue, FeePerToken, SwapExtremums] | undefined {
  const minExFee = minExFeeForOrder(OrderKind.Swap, fees, minExecutorReward)
  const vars = swapVars(minExFee, nitro, minOutput)
  if (vars) {
    const [fpt, extremums] = vars
    const swapValue = minSwapValue(input, extremums.maxExFee, extremums.maxOutput, txMath)
    const orderTxFee = fees.swapOrder
    const swapBudget = add(add(swapValue, AdaEntry(orderTxFee)), AdaEntry(uiFee))
    return [swapBudget, swapValue, fpt, extremums]
  } else {
    return undefined
  }
}

/** Calculate min Value for Swap order output.
 */
export function minSwapValue(
  input: AssetAmount,
  maxExFee: Lovelace,
  maxOutput: AssetAmount,
  txMath: TxMath
): SwapValue {
  let baseValue = add(Value(maxExFee), input.toEntry)
  if (!maxOutput.isAda) {
    const preValue = Value(1n, maxOutput)
    const minLovelace = txMath.minUtxoValue(preValue, false)
    baseValue = add(baseValue, AdaEntry(minLovelace))
  }
  return baseValue
}
