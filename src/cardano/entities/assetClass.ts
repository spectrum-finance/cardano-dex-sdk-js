import {encodeHex} from "../../utils/hex.js"
import {AssetName, PolicyId, Subject} from "../types.js"

export type AssetClass = {
  policyId: PolicyId
  name: AssetName
}

export const mkSubject = ({policyId, name}: AssetClass): Subject =>
  `${policyId}${encodeHex(new TextEncoder().encode(name))}`

export const isAssetClassEquals = (ac1: AssetClass, ac2: AssetClass): boolean =>
  mkSubject(ac1) === mkSubject(ac2)
