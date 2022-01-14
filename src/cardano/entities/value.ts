import {AssetAmount} from "../../domain/assetAmount"
import {AdaAssetClass} from "../constants"
import {Lovelace} from "../types"
import {AssetClass} from "./assetClass"
import {AdaEntry, AssetEntry} from "./assetEntry"

export type Value = AssetEntry[]

export const emptyValue: Value = []

export function Value(coins: Lovelace, other: AssetAmount | AssetAmount[] | undefined = undefined): Value {
  if (other instanceof AssetAmount) {
    return [AdaEntry(coins), other.toEntry]
  } else if (other) {
    const ada = other
      .filter(am => am.isAda)
      .map(am => am.amount)
      .reduce((acc, rhs) => acc + rhs, 0n)
    return [AdaEntry(coins + ada), ...other.map(am => am.toEntry)]
  } else {
    return [AdaEntry(coins)]
  }
}

export function getLovelace(v: Value): Lovelace {
  return assetAmountOf(v, AdaAssetClass)
}

export function assetAmountOf(v: Value, asset: AssetClass): Lovelace {
  return v.find(e => e.policyId === asset.policyId && e.name === asset.name)?.quantity ?? 0n
}
