import {AssetAmount} from "../../domain/assetAmount"
import {AdaAssetClass} from "../constants"
import {Lovelace} from "../types"
import {AssetClass} from "./assetClass"
import {AdaEntry, AssetEntry, assetEntryToClass} from "./assetEntry"

export type Value = AssetEntry[]

export function add(value: Value, x: AssetEntry): Value {
  const amt = assetAmountOf(value, assetEntryToClass(x))
  return [...value.filter(e => e !== x), amt.add(x.quantity).toEntry] // todo: check comparison
}

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

export function getLovelace(v: Value): AssetAmount {
  return assetAmountOf(v, AdaAssetClass)
}

export function assetAmountOf(v: Value, asset: AssetClass): AssetAmount {
  const amt = v.find(e => e.policyId === asset.policyId && e.name === asset.name)?.quantity ?? 0n
  return new AssetAmount(asset, amt)
}
