import {Datum, Hash32, TxHash} from "../types"
import {Addr} from "./address"
import {Value} from "./value"

export type TxOut = {
  txHash: TxHash
  index: number
  value: Value
  addr: Addr
  dataHash?: Hash32
}

export type FullTxOut = TxOut & {
  dataBin?: Datum
}

export type TxOutCandidate = {
  value: Value
  addr: Addr
  data?: Datum
}
