import {AssetClass} from "../../cardano/entities/assetClass.js"

export type PoolConfig = {
  nft: AssetClass
  x: AssetClass
  y: AssetClass
  lq: AssetClass
  feeNum: number
}
