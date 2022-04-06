import {AssetName, PolicyId} from "../types"

export type AssetInfo = {
  name: AssetName
  policyId: PolicyId
  emission: bigint
}
