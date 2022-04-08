import {AssetName, PolicyId, Subject} from "../types"

export type AssetClass = {
  policyId: PolicyId
  name: AssetName
  subject: Subject;
}
