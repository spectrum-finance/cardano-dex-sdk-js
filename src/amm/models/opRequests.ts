import {AssetClass} from "../../cardano/entities/assetClass"
import {PubKeyHash} from "../../cardano/entities/publicKey"
import {Lovelace} from "../../cardano/types"
import {AssetAmount} from "../../domain/assetAmount"
import {FeePerToken} from "../domain/models"
import {PoolId} from "../domain/types"

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
  readonly lq: AssetClass
  readonly rewardPkh: PubKeyHash
  readonly exFee: Lovelace
  readonly uiFee: Lovelace
  readonly collateralAda: Lovelace
}

export type RedeemRequest = {
  readonly kind: OrderRequestKind.Redeem
  readonly poolId: PoolId
  readonly x: AssetClass
  readonly y: AssetClass
  readonly lq: AssetAmount
  readonly rewardPkh: PubKeyHash
  readonly exFee: Lovelace
  readonly uiFee: Lovelace
}

export type SwapRequest = {
  readonly kind: OrderRequestKind.Swap
  readonly poolId: PoolId
  readonly rewardPkh: PubKeyHash
  readonly poolFeeNum: number
  readonly baseInput: AssetAmount
  readonly quoteAsset: AssetClass
  readonly minQuoteOutput: bigint
  readonly exFeePerToken: FeePerToken
  readonly uiFee: Lovelace
}

export type OrderRequest = DepositRequest | RedeemRequest | SwapRequest
