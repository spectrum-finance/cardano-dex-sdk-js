import {AdaEntry} from "../../cardano/entities/assetEntry.ts"
import {add, Value} from "../../cardano/entities/value.ts"
import {Lovelace} from "../../cardano/types.ts"
import {TxMath} from "../../cardano/wallet/txMath.ts"
import {AssetAmount} from "../../domain/assetAmount.ts"
import {OrderKind} from "../models/opRequests.ts"
import {AmmTxFeeMapping, minExFeeForOrder} from "./order.ts"

export type RedeemBudget = Value
export type RedeemValue = Value

/** Estimate min Value required for Redeem operation.
 *  Note: RedeemBudget includes RedeemValue
 *  @return [RedeemBudget, RedeemValue]
 */
export function minBudgetForRedeem(
  inputLq: AssetAmount,
  estimatedOutputX: AssetAmount,
  estimatedOutputY: AssetAmount,
  fees: AmmTxFeeMapping,
  minExecutorReward: Lovelace,
  uiFee: Lovelace,
  txMath: TxMath
): [RedeemBudget, RedeemValue] {
  const minExFee = minExFeeForOrder(OrderKind.Deposit, fees, minExecutorReward)
  const depositValue = minRedeemValue(inputLq, estimatedOutputX, estimatedOutputY, minExFee, txMath)
  const orderTxFee = fees.depositOrder
  return [add(add(depositValue, AdaEntry(orderTxFee)), AdaEntry(uiFee)), depositValue]
}

/** Calculate min Value for Deposit order output.
 * @return RedeemValue
 */
export function minRedeemValue(
  inputLq: AssetAmount,
  estimatedOutputX: AssetAmount,
  estimatedOutputY: AssetAmount,
  exFee: Lovelace,
  txMath: TxMath
): RedeemValue {
  const estimatedOutputLovelace = estimatedOutputX.isAda
    ? estimatedOutputX.amount
    : estimatedOutputY.isAda
    ? estimatedOutputY.amount
    : 0n
  const minOutputLovelace = estimatedOutputLovelace / 2n
  const preValue = Value(1000000n, [estimatedOutputX, estimatedOutputY])
  const minLovelace = txMath.minUtxoValue(preValue, false)
  const addedLovelace = minLovelace > minOutputLovelace ? minLovelace - minOutputLovelace : 0n
  return add(add(Value(exFee), inputLq.toEntry), AdaEntry(addedLovelace))
}
