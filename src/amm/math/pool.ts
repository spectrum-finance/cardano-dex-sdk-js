import {AssetAmount} from "../../domain/assetAmount";
import {HexString, Lovelace, TxHash} from "../../cardano/types";
import {Value} from "../../cardano/entities/value";
import {Addr} from "../../cardano/entities/address";

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
  readonly changeAddress: Addr
  readonly collateralAmount?: bigint;
}

export function makePoolCreationParams(
  x: AssetAmount,
  y: AssetAmount,
  fee: number,
  uiFee: bigint
): PoolCreationParams | undefined {

  const mockPoolCreationParams: PoolCreationParams = undefined

  return mockPoolCreationParams
}

