import {AssetAmount} from "../../domain/assetAmount.ts"
import {PoolId} from "../domain/types.ts"

export type AmmPoolInfo = {
  id: PoolId
  lp: AssetAmount
  reservesX: AssetAmount
  reservesY: AssetAmount
}
