import {AdaAssetName, AdaPolicyId} from "../constants"
import {AssetName, Lovelace, PolicyId} from "../types"
import {AssetClass} from "./assetClass"

export type AssetEntry = {
  name: AssetName
  policyId: PolicyId
  quantity: bigint
}

export function assetEntryToClass(e: AssetEntry): AssetClass {
  return {policyId: e.policyId, name: e.name}
}

export function AdaEntry(quantity: Lovelace): AssetEntry {
  return {name: AdaAssetName, policyId: AdaPolicyId, quantity}
}

export function isAssetEntryEquals(e1: AssetEntry, e2: AssetEntry): boolean {
  return e1.name === e2.name &&
    e1.quantity === e2.quantity &&
    e1.policyId === e2.policyId
}
