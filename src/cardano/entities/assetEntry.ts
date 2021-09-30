import {AssetName, PolicyId} from "../types"

export type AssetEntry = {
  name: AssetName
  policyId: PolicyId
  value: bigint
}
