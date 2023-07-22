import {AdaAssetName, AdaAssetNameHex, AdaPolicyId} from "../constants"
import {AssetName, HexString, Lovelace, PolicyId} from "../types"
import {AssetClass} from "./assetClass"

export type AssetEntry = {
  name: AssetName;
  policyId: PolicyId;
  nameHex: HexString;
  quantity: bigint
}

export function assetEntryToClass(e: AssetEntry): AssetClass {
  return {policyId: e.policyId, name: e.name, nameHex: e.nameHex}
}

export function AdaEntry(quantity: Lovelace): AssetEntry {
  return {name: AdaAssetName, policyId: AdaPolicyId, quantity, nameHex: AdaAssetNameHex}
}
