import {AssetName, PolicyId} from "../types.ts"

export type AssetInfo = {
  name: AssetName
  policyId: PolicyId
  emission: bigint
}
