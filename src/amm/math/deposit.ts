import {AdaEntry} from "../../cardano/entities/assetEntry"
import {add, Value} from "../../cardano/entities/value"
import {Lovelace} from "../../cardano/types"
import {TxMath} from "../../cardano/wallet/txMath"
import {AssetAmount} from "../../domain/assetAmount"
import {OrderKind} from "../models/opRequests"
import {AmmTxFeeMapping, minExFeeForOrder} from "./order"

export type DepositBudget = Value
export type DepositValue = Value

/** Estimate min Value required for Deposit operation.
 *  Note: SwapBudget includes SwapValue
 *  @return [SwapBudget, SwapValue, FeePerToken, SwapExtremums]
 */
export function minBudgetForDeposit(
  inputX: AssetAmount,
  inputY: AssetAmount,
  estimatedOutputLq: AssetAmount,
  fees: AmmTxFeeMapping,
  minExecutorReward: Lovelace,
  uiFee: Lovelace,
  txMath: TxMath
): DepositBudget {
  const minExFee = minExFeeForOrder(OrderKind.Deposit, fees, minExecutorReward)
  const [depositValue] = minDepositValue(inputX, inputY, estimatedOutputLq, minExFee, txMath)
  const orderTxFee = fees.depositOrder
  return add(add(depositValue, AdaEntry(orderTxFee)), AdaEntry(uiFee))
}

/** Calculate min Value for Deposit order output.
 * @return [DepositValue, DepositCollateral]
 */
export function minDepositValue(
  inputX: AssetAmount,
  inputY: AssetAmount,
  estimatedOutputLq: AssetAmount,
  exFee: Lovelace,
  txMath: TxMath
): [DepositValue, Lovelace] {
  const preValue = Value(1n, estimatedOutputLq)
  const minCollateral = txMath.minUtxoValue(preValue, false)
  return [add(add(add(Value(exFee), inputX.toEntry), inputY.toEntry), AdaEntry(minCollateral)), minCollateral]
}
