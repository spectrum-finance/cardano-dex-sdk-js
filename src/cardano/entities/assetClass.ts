import {AssetName, HexString, PolicyId, Subject} from "../types"

export type AssetClass = {
  policyId: PolicyId
  name: AssetName
  nameHex: HexString;
}

export const mkSubject = ({policyId, nameHex}: AssetClass): Subject =>
  `${policyId}${nameHex}`

export const isAssetClassEquals = (ac1: AssetClass, ac2: AssetClass): boolean =>
  mkSubject(ac1) === mkSubject(ac2)
