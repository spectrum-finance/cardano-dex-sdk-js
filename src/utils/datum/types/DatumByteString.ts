import {DatumTypeFactory} from "../datumSchema"
import {HexString} from "../../../cardano/types"
import { PlutusData } from "@emurgo/cardano-serialization-lib-nodejs"
import {decodeHex, encodeHex} from "../../hex"

export const DatumByteString: DatumTypeFactory<HexString> = (wasm) => {
  return {
    serialize(value: HexString): PlutusData {
      return wasm.PlutusData.new_bytes(decodeHex(value))
    },
    deserialize(pd: PlutusData): HexString {
      return encodeHex(pd.as_bytes()!);
    }
  }
}
