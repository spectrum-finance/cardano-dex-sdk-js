import {AssetClass} from "../../cardano/entities/assetClass.ts"
import {AssetAmount} from "../../domain/assetAmount.ts"
import {PoolId} from "../domain/types.ts"

export type AmmOrderInfo = {poolId: PoolId} & (Swap | Deposit | Redeem)

export type Swap = {
  type: "swap"
  from: AssetAmount
  to: AssetClass
  toMinAmount: bigint
}

export type Deposit = {
  type: "deposit"
  inX: AssetAmount
  inY: AssetAmount
}

export type Redeem = {
  type: "redeem"
  inLq: AssetAmount
}
