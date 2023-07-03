import {AssetAmount} from "../../domain/assetAmount";

export interface PoolCreationParams {
  readonly x: AssetAmount
  readonly y: AssetAmount
  readonly ada?: AssetAmount
  readonly nft: AssetAmount
  readonly lq: AssetAmount
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

