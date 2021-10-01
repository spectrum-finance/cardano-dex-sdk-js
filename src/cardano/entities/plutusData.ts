import {Hash32} from "../types"
import {notImplemented} from "../../utils/notImplemented"
import {stringToBytea} from "../../utils/utf8"

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

export function hashPlutusData(data: PlutusData): Hash32 {
  return notImplemented([data])
}
