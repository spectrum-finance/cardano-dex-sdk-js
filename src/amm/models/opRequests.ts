import {Addr} from "../../cardano/entities/address";
import {AssetClass} from "../../cardano/entities/assetClass"
import {PubKeyHash} from "../../cardano/entities/publicKey"
import {Value} from "../../cardano/entities/value"
import {HexString, Lovelace, TxHash} from "../../cardano/types"
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

export enum OrderKind {
  Deposit,
  Redeem,
  Swap,
  PoolCreation = 3
}

export function foldOrderKind<A>(
  onDeposit: () => A,
  onRedeem: () => A,
  onSwap: () => A,
  onPoolCreation: () => A
): (kind: OrderKind) => A {
  return (kind: OrderKind) => {
    switch (kind) {
      case OrderKind.Deposit:
        return onDeposit()
      case OrderKind.Redeem:
        return onRedeem()
      case OrderKind.Swap:
        return onSwap()
      case OrderKind.PoolCreation:
        return onPoolCreation()
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

export type PoolCreationRequest = {
  readonly kind: OrderKind.PoolCreation
  readonly x: AssetAmount
  readonly y: AssetAmount
  readonly lq: AssetAmount
  readonly lqMintingScript: HexString
  readonly nft: AssetAmount
  readonly nftMintingScript: HexString
  readonly feeNum: bigint
  readonly uiFee: Lovelace
  readonly poolValue: Value
  readonly mintingCreationTxHash: TxHash
  readonly mintingCreationTxOutIdx: number
  readonly userAddress: Addr
}

export type OrderRequest = DepositRequest | RedeemRequest | SwapRequest | PoolCreationRequest
