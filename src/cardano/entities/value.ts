import {Lovelace} from "../types"
import {AssetEntry} from "./assetEntry"

export type Value = {
  coins: Lovelace
  assets?: AssetEntry[]
}

export function Value(coins: Lovelace, assets: AssetEntry[] | undefined = undefined): Value {
  return {
    coins,
    assets
  }
}
