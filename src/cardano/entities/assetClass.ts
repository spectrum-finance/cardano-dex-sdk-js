import {encodeHex} from "../../utils/hex"
import {AssetName, PolicyId, Subject} from "../types"

export type AssetClass = {
  policyId: PolicyId
  name: AssetName
}

export const mkSubject = ({policyId, name}: AssetClass): Subject =>
  `${policyId}${encodeHex(new TextEncoder().encode(name))}`
