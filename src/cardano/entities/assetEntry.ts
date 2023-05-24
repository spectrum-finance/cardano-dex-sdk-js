import {AdaAssetName, AdaPolicyId} from "../constants.ts"
import {AssetName, Lovelace, PolicyId} from "../types.ts"
import {AssetClass} from "./assetClass.ts"

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
