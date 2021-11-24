import {Hash32} from "../types"
import {SAddr} from "./address"
import {PlutusData} from "./plutusData"
import {Value} from "./value"

export type TxOut = {
  value: Value
  addr: SAddr
  dataHash?: Hash32
}

export type FullTxOut = TxOut & {
  data?: PlutusData
}

export type TxOutCandidate = {
  value: Value
  addr: SAddr
  data?: PlutusData
}
