import {Lovelace} from "../../cardano/types"
import {foldOrderKind, OrderKind} from "../models/opRequests"

export type AmmTxFeeMapping = {
  swapOrder: Lovelace
  depositOrder: Lovelace
  redeemOrder: Lovelace
  swapExecution: Lovelace
  poolCreation: Lovelace
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
      () => fees.swapExecution,
      () => fees.poolCreation
    )(kind) + minExecutorReward
  )
}

export function maxExFeeForOrder(
  kind: OrderKind,
  fees: AmmTxFeeMapping,
  minExecutorReward: Lovelace,
): Lovelace {
  return (
    foldOrderKind(
      () => fees.depositExecution,
      () => fees.redeemExecution,
      () => fees.swapExecution,
      () => fees.poolCreation
    )(kind) + minExecutorReward
  )
}
