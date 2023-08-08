import { PlutusData } from "@emurgo/cardano-serialization-lib-nodejs"
import {DatumTypeFactory} from "../datumSchema"

export const DatumInt: DatumTypeFactory<number> = (wasm) => {
  return {
    serialize(value: number): PlutusData {
      return wasm.PlutusData.new_integer(wasm.BigInt.from_str(value.toString()));
    },
    deserialize(pd: PlutusData): number {
      return Number(pd.as_integer()?.to_str()!)
    }
  }
}
