import { PlutusData } from "@emurgo/cardano-serialization-lib-nodejs"
import {DatumTypeFactory} from "../datumSchema"

export const DatumBigint: DatumTypeFactory<bigint> = (wasm) => {
  return {
    serialize(value: bigint): PlutusData {
      return wasm.PlutusData.new_integer(wasm.BigInt.from_str(value.toString()));
    },
    deserialize(pd: PlutusData): bigint {
      return BigInt(pd.as_integer()?.to_str()!)
    }
  }
}
