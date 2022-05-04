import {AssetClass} from "../../cardano/entities/assetClass"

export type PoolConfig = {
  nft: AssetClass
  x: AssetClass
  y: AssetClass
  lq: AssetClass
  feeNum: number
}
