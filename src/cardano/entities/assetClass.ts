import {encodeHex} from "../../utils/hex"
import {AssetName, HexString, PolicyId, Subject} from "../types"

export type AssetClass = {
  policyId: PolicyId
  name: AssetName
  hex: HexString;
}

export const mkSubject = ({policyId, name}: AssetClass): Subject =>
  `${policyId}${encodeHex(new TextEncoder().encode(name))}`

export const isAssetClassEquals = (ac1: AssetClass, ac2: AssetClass): boolean =>
  mkSubject(ac1) === mkSubject(ac2)
