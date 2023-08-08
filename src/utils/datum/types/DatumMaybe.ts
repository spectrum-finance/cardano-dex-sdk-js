import { PlutusData } from "@emurgo/cardano-serialization-lib-nodejs"
import {DatumTypeFactory} from "../datumSchema"


export const DatumMaybe = <T>(datumTypeFactory: DatumTypeFactory<T>): DatumTypeFactory<T | undefined> => (
  wasm
) => {
  return {
    serialize(value: T | undefined): PlutusData {
      const bf = wasm.PlutusList.new()
      if (value) {
        bf.add(datumTypeFactory(wasm).serialize(value))
        return wasm.PlutusData.new_constr_plutus_data(wasm.ConstrPlutusData.new(wasm.BigNum.zero(), bf))
      } else {
        return wasm.PlutusData.new_constr_plutus_data(wasm.ConstrPlutusData.new(wasm.BigNum.from_str("1"), bf))
      }
    },
    deserialize(pd: PlutusData): T | undefined {
      const constr = pd.as_constr_plutus_data()
      if (constr) {
        return constr.alternative().is_zero() ? datumTypeFactory(wasm).deserialize(constr.data().get(0)) : undefined
      } else {
        return undefined
      }
    }
  }
}
