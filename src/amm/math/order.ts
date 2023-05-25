import {Lovelace} from "../../cardano/types.js"
import {foldOrderKind, OrderKind} from "../models/opRequests.js"

export type AmmTxFeeMapping = {
  swapOrder: Lovelace
  depositOrder: Lovelace
  redeemOrder: Lovelace
  swapExecution: Lovelace
  depositExecution: Lovelace
  redeemExecution: Lovelace
}

export function minExFeeForOrder(
  kind: OrderKind,
  fees: AmmTxFeeMapping,
  minExecutorReward: Lovelace
): Lovelace {
  return (
    foldOrderKind(
      () => fees.depositExecution,
      () => fees.redeemExecution,
      () => fees.swapExecution
    )(kind) + minExecutorReward
  )
}
