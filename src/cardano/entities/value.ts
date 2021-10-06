import {Lovelace} from "../types"
import {AssetEntry} from "./assetEntry"
import {AssetAmount} from "../../domain/assetAmount"

export type Value = {
  coins: Lovelace
  assets?: AssetEntry[]
}

export function Value(coins: Lovelace, other: AssetAmount | AssetAmount[] | undefined = undefined): Value {
  if (other instanceof AssetAmount) {
    return other.isAda ? {coins: coins + other.amount} : {coins, assets: [other.toEntry]}
  } else if (other) {
    const ada = other.filter(am => am.isAda).map(am => am.amount).reduce((acc, rhs) => acc + rhs, 0n)
    return {coins: coins + ada, assets: other.map(am => am.toEntry)}
  } else {
    return {coins}
  }
}
