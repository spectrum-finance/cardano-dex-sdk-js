import {Addr, Datum, Hash32, TxHash} from "../types"
import {Value} from "./value"

export type TxOut = {
  txHash: TxHash
  index: number
  value: Value
  addr: Addr
  dataHash?: Hash32
}

export type FullTxOut = TxOut & {
  data?: Datum
}

export type TxOutCandidate = {
  value: Value
  addr: Addr
  data?: Datum
}
