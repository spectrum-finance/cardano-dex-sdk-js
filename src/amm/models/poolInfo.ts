import {AssetAmount} from "../../domain/assetAmount"
import {PoolId} from "../domain/types"

export type AmmPoolInfo = {
  id: PoolId
  lp: AssetAmount
  reservesX: AssetAmount
  reservesY: AssetAmount
}
