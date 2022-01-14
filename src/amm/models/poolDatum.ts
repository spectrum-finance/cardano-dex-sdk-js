import {AssetClass} from "../../cardano/entities/assetClass"

export type PoolDatum = {
  nft: AssetClass
  x: AssetClass
  y: AssetClass
  lq: AssetClass
  feeNum: number
}
