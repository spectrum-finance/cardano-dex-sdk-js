import {AssetEntry} from "../../cardano/entities/assetEntry"
import {TxHash, TxOutRef} from "../../cardano/types"
import {AssetAmount} from "../../domain/assetAmount"
import {AmmOrderInfo} from "./orderInfo"
import {AmmPoolInfo} from "./poolInfo"

export type AmmOrderStatus = "pending" | "submitted" | "executed" | "settled" | 'locked'

export type AmmOrderType = "swap" | "deposit" | "redeem"

export type AmmOperationType = "order" | "refund" | "setup"

export type AmmOrder = {
  type: "order"
  height: bigint
  txHash: TxHash
  outRef: TxOutRef
  status: AmmOrderStatus
  order: AmmOrderInfo
  output?: AssetEntry[]
  timestamp: number;
}

export type TxStatus = "confirmed" | "unconfirmed"

export type PoolSetup = {
  type: "setup"
  height: bigint
  txHash: TxHash
  status: TxStatus
  pool: AmmPoolInfo
  reward: AssetAmount
  timestamp: number;
}

export type RefundOperation = {
  type: "refund"
  height: bigint
  txHash: TxHash
  status: TxStatus
  order: AmmOrderInfo
  timestamp: number;
}

export type AmmDexOperation = AmmOrder | RefundOperation | PoolSetup
