import {AssetAmount} from "../../domain/assetAmount"
import {Lovelace} from "../types"
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
