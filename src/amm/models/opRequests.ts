import {AssetClass} from "../../cardano/entities/assetClass.ts"
import {PubKeyHash} from "../../cardano/entities/publicKey.ts"
import {Value} from "../../cardano/entities/value.ts"
import {Lovelace} from "../../cardano/types.ts"
import {AssetAmount} from "../../domain/assetAmount.ts"
import {FeePerToken} from "../domain/models.ts"
import {PoolId} from "../domain/types.ts"

export type CreateRequest = {
  readonly x: AssetAmount
  readonly y: AssetAmount
  readonly feeNumerator: number
  readonly outputShare: bigint
  readonly uiFee: Lovelace
}

export enum OrderKind {
  Deposit,
  Redeem,
  Swap
}

export function foldOrderKind<A>(
  onDeposit: () => A,
  onRedeem: () => A,
  onSwap: () => A
): (kind: OrderKind) => A {
  return (kind: OrderKind) => {
    switch (kind) {
      case OrderKind.Deposit:
        return onDeposit()
      case OrderKind.Redeem:
        return onRedeem()
      case OrderKind.Swap:
        return onSwap()
    }
  }
}

export type DepositRequest = {
  readonly kind: OrderKind.Deposit
  readonly poolId: PoolId
  readonly x: AssetAmount
  readonly y: AssetAmount
  readonly lq: AssetClass
  readonly rewardPkh: PubKeyHash
  readonly stakePkh: PubKeyHash | undefined
  readonly exFee: Lovelace
  readonly uiFee: Lovelace
  readonly collateralAda: Lovelace
  readonly orderValue: Value
}

export type RedeemRequest = {
  readonly kind: OrderKind.Redeem
  readonly poolId: PoolId
  readonly x: AssetClass
  readonly y: AssetClass
  readonly lq: AssetAmount
  readonly rewardPkh: PubKeyHash
  readonly stakePkh: PubKeyHash | undefined
  readonly exFee: Lovelace
  readonly uiFee: Lovelace
  readonly orderValue: Value
}

export type SwapRequest = {
  readonly kind: OrderKind.Swap
  readonly poolId: PoolId
  readonly rewardPkh: PubKeyHash
  readonly stakePkh: PubKeyHash | undefined
  readonly poolFeeNum: number
  readonly baseInput: AssetAmount
  readonly quoteAsset: AssetClass
  readonly minQuoteOutput: bigint
  readonly exFeePerToken: FeePerToken
  readonly uiFee: Lovelace
  readonly orderValue: Value
}

export type OrderRequest = DepositRequest | RedeemRequest | SwapRequest
