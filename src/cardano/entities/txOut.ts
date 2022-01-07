import {PlutusData} from "@emurgo/cardano-serialization-lib-browser"
import {Hash32, TxHash} from "../types"
import {SAddr} from "./address"
import {TxIn} from "./txIn"
import {Value} from "./value"

export type TxOut = {
  txHash: TxHash,
  index: number,
  value: Value
  addr: SAddr
  dataHash?: Hash32
}

export function txOutToTxIn(out: TxOut): TxIn {
  return {outTxHash: out.txHash, outIndex: out.index}
}

export type FullTxOut = TxOut & {
  data?: PlutusData
}

export type TxOutCandidate = {
  value: Value
  addr: SAddr
  data?: PlutusData
}
