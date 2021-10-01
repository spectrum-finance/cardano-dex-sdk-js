import {Value} from "./value"
import {SAddr} from "./address"
import {Hash32} from "../types"
import {PlutusData} from "./plutusData"

export type Output = {
  value: Value
  addr: SAddr
  dataHash?: Hash32
}

export type FullOutput = Output & {
  data?: PlutusData
}

export type OutputCandidate = {
  value: Value
  addr: SAddr
  data?: PlutusData
}
