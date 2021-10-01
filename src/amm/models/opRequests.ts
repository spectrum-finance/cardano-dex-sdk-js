import {PoolId} from "../domain/types"
import {AssetAmount} from "../../domain/assetAmount"
import {AssetId} from "../../cardano/entities/assetId"
import {Lovelace} from "../../cardano/types"
import {PubKeyHash} from "../../cardano/entities/publicKey"

export type CreateRequest = {
  readonly x: AssetAmount
  readonly y: AssetAmount
  readonly feeNumerator: number
  readonly outputShare: bigint
  readonly uiFee: Lovelace
}

export enum OrderRequestKind {
  Deposit,
  Redeem,
  Swap
}

export type DepositRequest = {
  readonly kind: OrderRequestKind.Deposit
  readonly poolId: PoolId
  readonly x: AssetAmount
  readonly y: AssetAmount
  readonly keyHash: PubKeyHash
  readonly exFee: Lovelace
  readonly uiFee: Lovelace
}

export type RedeemRequest = {
  readonly kind: OrderRequestKind.Redeem
  readonly poolId: PoolId
  readonly lp: AssetAmount
  readonly keyHash: PubKeyHash
  readonly exFee: Lovelace
  readonly uiFee: Lovelace
}

export type SwapRequest = {
  readonly kind: OrderRequestKind.Swap
  readonly poolId: PoolId
  readonly keyHash: PubKeyHash
  readonly poolFeeNum: number
  readonly baseInput: AssetAmount
  readonly quoteAsset: AssetId
  readonly minQuoteOutput: bigint
  readonly exFeePerToken: Lovelace
  readonly uiFee: Lovelace
}

export type OrderRequest = DepositRequest | RedeemRequest | SwapRequest
