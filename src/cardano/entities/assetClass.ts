import {AssetName, HexString, PolicyId, Subject} from "../types"
import {RustModule} from "../../utils/rustLoader"

export type AssetClass = {
  policyId: PolicyId
  name: AssetName
  nameHex: HexString;
}

export const mkSubject = ({policyId, nameHex}: AssetClass): Subject =>
  `${policyId}${JSON.parse(RustModule.CardanoWasm.AssetName.from_hex(nameHex).to_json())}`

export const isAssetClassEquals = (ac1: AssetClass, ac2: AssetClass): boolean =>
  mkSubject(ac1) === mkSubject(ac2)
