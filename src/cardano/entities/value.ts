import {AssetAmount} from "../../domain/assetAmount"
import {AdaAssetClass} from "../constants"
import {Lovelace} from "../types"
import {AssetClass} from "./assetClass"
import {AdaEntry, AssetEntry, assetEntryToClass} from "./assetEntry"

const byIdNameAndPolicy = (a: AssetEntry, b: AssetEntry): boolean =>
  a.policyId === b.policyId && a.name === b.name

export type Value = AssetEntry[]

export function sum(values: Value[]): Value {
  const dictionary: {[key: string]: AssetEntry} = {}

  for (let i = 0; i < values.length; i++) {
    const value = values[i]

    value.forEach(item => {
      const key = `${item.policyId}.${item.name}`

      if (!dictionary[key]) {
        dictionary[key] = item
      } else {
        dictionary[key] = {
          ...dictionary[key],
          quantity: dictionary[key].quantity + item.quantity
        }
      }
    })
  }

  return Object.values(dictionary)
}

export function add(value: Value, x: AssetEntry): Value {
  const amt = assetAmountOf(value, assetEntryToClass(x))
  return [...value.filter(e => e.policyId !== x.policyId || e.name !== x.name), amt.add(x.quantity).toEntry] // todo: check comparison
}

export function remove(value: Value, toRemove: Value): Value {
  return value.map(item => {
    const itemToRemove = toRemove.find(tri => byIdNameAndPolicy(item, tri))

    return itemToRemove ? {...item, quantity: item.quantity - itemToRemove.quantity} : item
  })
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
    return [AdaEntry(coins + ada), ...other.filter(am => !am.isAda).map(am => am.toEntry)]
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
