import {Lovelace} from "../types"
import {AssetEntry} from "./assetEntry"

export type Value = {
  coins: Lovelace
  assets?: AssetEntry[]
}
