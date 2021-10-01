import {Hash32} from "../types"
import {stringToBytea} from "../../utils/utf8"
import * as wasm from "@emurgo/cardano-serialization-lib-browser"
import {RustModule} from "../../utils/rustLoader"
import {encodeHex} from "../../utils/hex"

export enum PlutusDataKind {
  Map,
  List,
  Integer,
  Bytes
}

export type PlutusData = PlutusMap | PlutusList | PlutusInteger | PlutusBytes

export type PlutusMap = {
  kind: PlutusDataKind.Map
  value: Map<PlutusData, PlutusData>
}

export function PlutusMap(value: {[key: string]: PlutusData}): PlutusMap {
  const map = new Map<PlutusData, PlutusData>()
  for (const [k, v] of Object.entries(value)) {
    const plutusKey = PlutusBytes(stringToBytea(k))
    map.set(plutusKey, v)
  }
  return {
    kind: PlutusDataKind.Map,
    value: map
  }
}

export type PlutusList = {
  kind: PlutusDataKind.List
  value: PlutusData[]
}

export type PlutusInteger = {
  kind: PlutusDataKind.Integer
  value: bigint
}

export type PlutusBytes = {
  kind: PlutusDataKind.Bytes
  value: Uint8Array
}

export function PlutusBytes(value: Uint8Array): PlutusBytes {
  return {
    kind: PlutusDataKind.Bytes,
    value
  }
}

export function plutusDataToWasm(data: PlutusData): wasm.PlutusData {
  switch (data.kind) {
    case PlutusDataKind.Integer:
      return RustModule.CardanoWasm.PlutusData.new_integer(
        RustModule.CardanoWasm.BigInt.from_str(data.value.toString())
      )
    case PlutusDataKind.Bytes:
      return RustModule.CardanoWasm.PlutusData.new_bytes(data.value)
    case PlutusDataKind.List:
      const plist = RustModule.CardanoWasm.PlutusList.new()
      for (const dt of data.value) {
        plist.add(plutusDataToWasm(dt))
      }
      return RustModule.CardanoWasm.PlutusData.new_list(plist)
    case PlutusDataKind.Map:
      const pmap = RustModule.CardanoWasm.PlutusMap.new()
      for (const [k, v] of data.value.entries()) {
        pmap.insert(plutusDataToWasm(k), plutusDataToWasm(v))
      }
      return RustModule.CardanoWasm.PlutusData.new_map(pmap)
  }
}

export function hashPlutusData(data: PlutusData): Hash32 {
  return encodeHex(RustModule.CardanoWasm.hash_plutus_data(plutusDataToWasm(data)).to_bytes())
}
