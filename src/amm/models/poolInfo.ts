import {AssetAmount} from "../../domain/assetAmount.js"
import {PoolId} from "../domain/types.js"

export type AmmPoolInfo = {
  id: PoolId
  lp: AssetAmount
  reservesX: AssetAmount
  reservesY: AssetAmount
}
