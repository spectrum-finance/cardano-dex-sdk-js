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

export function isAssetEntryEquals(ae1: AssetEntry, ae2: AssetEntry): boolean {
  return ae1.name === ae2.name &&
    ae1.quantity === ae2.quantity &&
    ae1.policyId === ae2.policyId
}
