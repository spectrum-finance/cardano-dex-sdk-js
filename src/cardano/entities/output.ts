import {Hash32} from "../types"
import {SAddr} from "./address"
import {PlutusData} from "./plutusData"
import {Value} from "./value"

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
