import {AssetName, MintingPolicy, PolicyId} from "../types"

export type AssetInfo = {
  name: AssetName
  policyId: PolicyId
  policy: MintingPolicy
  emission: bigint
}
