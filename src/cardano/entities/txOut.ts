import {Datum, Hash32, HexString, TxHash} from "../types.js"
import {Addr} from "./address.js"
import {Value} from "./value.js"

export type TxOut = {
  txHash: TxHash
  index: number
  value: Value
  addr: Addr
  dataHash?: Hash32
  dataBin?: HexString
}

export type FullTxOut = TxOut & {
  dataBin?: Datum
}

export type TxOutCandidate = {
  value: Value
  addr: Addr
  data?: Datum
}
