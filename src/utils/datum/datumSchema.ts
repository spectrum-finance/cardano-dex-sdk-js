import {PlutusData, PlutusDatumSchema} from "@emurgo/cardano-serialization-lib-nodejs"

export interface DatumType<T> {
  serialize(value: T): PlutusData;
  deserialize(pd: PlutusData): T;
}

export type DatumTypeFactory<T> = (wasm: CardanoWasm) => DatumType<T>;

import {HexString} from "../../cardano/types"
import {CardanoWasm} from "../rustLoader"

export interface DatumSchema<T> {
  fromHex (hex: HexString): T;
  fromBytes (bytes: Uint8Array): T;
  fromJson (str: string, schema: PlutusDatumSchema): T;
}

//@ts-ignore
export type DatumDescriptor<T> = { [key in keyof T]: { position: number; type: DatumTypeFactory<T[key]>  } };

export const mkDatumSchema = <T>(descriptor: DatumDescriptor<T>, wasm: CardanoWasm): DatumSchema<T> => {
  const parsePd = (pd: PlutusData): T => {
    const constr = pd.as_constr_plutus_data()?.data();

    if (!constr) {
      throw new Error('datum is empty');
    }

    return Object
      .entries(descriptor)
      .reduce<T>((acc: T, [key, item]: [string, any]) => ({
        ...acc,
        [key]: item.type(wasm).deserialize(constr.get(item.position))
      }), {} as T);
  }

  return {
    fromBytes(bytes: Uint8Array): T {
      return parsePd(wasm.PlutusData.from_bytes(bytes));
    },
    fromHex(hex: HexString): T {
      return parsePd(wasm.PlutusData.from_hex(hex));
    },
    fromJson(str: string, schema: PlutusDatumSchema): T {
      return parsePd(wasm.PlutusData.from_json(str, schema));
    }
  }
}
