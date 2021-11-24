import {AdaAssetName, AdaPolicyId} from "../constants"
import {AssetName, Lovelace, PolicyId} from "../types"

export type AssetEntry = {
  name: AssetName
  policyId: PolicyId
  quantity: bigint
}

export function AdaEntry(quantity: Lovelace): AssetEntry {
  return {name: AdaAssetName, policyId: AdaPolicyId, quantity}
}
