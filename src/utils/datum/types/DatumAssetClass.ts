import { PlutusData } from "@emurgo/cardano-serialization-lib-nodejs"
import {AssetClass} from "../../../cardano/entities/assetClass"
import {decodeHex, encodeHex} from "../../hex"
import {DatumTypeFactory} from "../datumSchema"



export const DatumAssetClass: DatumTypeFactory<AssetClass> = (wasm) => {
  return {
    serialize(value: AssetClass): PlutusData {
      const assetClass = wasm.PlutusList.new()
      assetClass.add(wasm.PlutusData.new_bytes(decodeHex(value.policyId)))
      assetClass.add(wasm.PlutusData.new_bytes(new TextEncoder().encode(value.name)))

      return wasm.PlutusData.new_constr_plutus_data(wasm.ConstrPlutusData.new(wasm.BigNum.zero(), assetClass))
    },
    deserialize(pd: PlutusData): AssetClass {
      const ac = pd.as_constr_plutus_data()!.data()
      const policyId = encodeHex(ac.get(0).as_bytes()!)
      const name = new TextDecoder().decode(ac.get(1).as_bytes()!)
      const hex = ac.get(1).to_hex()

      return {policyId, name, nameHex: hex}
    }
  }
}
