import {AdaAssetName, AdaPolicyId} from "../constants"
import {AssetName, HexString, Lovelace, PolicyId} from "../types"
import {AssetClass} from "./assetClass"

export type AssetEntry = {
  name: AssetName;
  policyId: PolicyId;
  hex: HexString;
  quantity: bigint
}

export function assetEntryToClass(e: AssetEntry): AssetClass {
  return {policyId: e.policyId, name: e.name, hex: e.hex}
}

export function AdaEntry(quantity: Lovelace): AssetEntry {
  return {name: AdaAssetName, policyId: AdaPolicyId, quantity, hex: ''}
}
