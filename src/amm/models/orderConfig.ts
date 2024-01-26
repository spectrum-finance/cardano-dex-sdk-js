import {AssetClass} from "../../cardano/entities/assetClass"
import {PubKeyHash} from "../../cardano/entities/publicKey"
import {FeePerToken} from "../domain/models"
import {PoolId} from "../domain/types"

export type LockConfig = {
  lockedUntil: number;
  redeemer: PubKeyHash;
}

export type SwapConfig = {
  base: AssetClass
  quote: AssetClass
  poolId: PoolId
  feeNum: bigint
  exFeePerToken: FeePerToken
  rewardPkh: PubKeyHash
  stakePkh: PubKeyHash | undefined
  baseAmount: bigint
  minQuoteAmount: bigint
}

export type DepositConfig = {
  poolId: PoolId
  x: AssetClass
  y: AssetClass
  lq: AssetClass
  exFee: bigint
  rewardPkh: PubKeyHash
  stakePkh: PubKeyHash | undefined
  collateralAda: bigint
}

export type RedeemConfig = {
  poolId: PoolId
  x: AssetClass
  y: AssetClass
  lq: AssetClass
  exFee: bigint
  rewardPkh: PubKeyHash
  stakePkh: PubKeyHash | undefined
}
