import {AssetClass} from "../../cardano/entities/assetClass"
import {AssetAmount} from "../../domain/assetAmount"
import {PoolId} from "../domain/types"

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
