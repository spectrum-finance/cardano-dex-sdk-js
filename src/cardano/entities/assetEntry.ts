import {AdaAssetName, AdaPolicyId} from "../constants"
import {AssetName, Lovelace, PolicyId} from "../types"

export type AssetEntry = {
  name: AssetName
  policyId: PolicyId
  amount: bigint
}

export function AdaEntry(amount: Lovelace): AssetEntry {
  return {name: AdaAssetName, policyId: AdaPolicyId, amount}
}
