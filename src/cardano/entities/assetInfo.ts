import {AssetName, PolicyId} from "../types.js"

export type AssetInfo = {
  name: AssetName
  policyId: PolicyId
  emission: bigint
}
