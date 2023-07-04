import {AssetAmount} from "../../domain/assetAmount";
import {HexString, Lovelace, TxHash} from "../../cardano/types";
import {Value} from "../../cardano/entities/value";
import {Addr} from "../../cardano/entities/address";
import {AssetClass} from "../../cardano/entities/assetClass";
import {sqrt} from "../../utils/math";

export interface PoolCreationParams {
  readonly x: AssetAmount
  readonly y: AssetAmount
  readonly nft: AssetAmount
  readonly nftMintingScript: HexString
  readonly lq: AssetAmount
  readonly lqMintingScript: HexString
  readonly value: Value
  readonly feeNum: bigint
  readonly uiFee: Lovelace
  readonly mintingCreationTxHash: TxHash
  readonly mintingCreationTxOutIdx: number
  readonly userAddress: Addr
  readonly collateralAmount?: bigint;
}

export function calculateInitUserRewardLq(x: AssetAmount, y: AssetAmount, lqAssetClass: AssetClass): AssetAmount {
  const lqValue = sqrt(x.amount * y.amount)
  return new AssetAmount(lqAssetClass, lqValue)
}

