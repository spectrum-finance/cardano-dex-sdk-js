import {HexString, TxHash, ValidityRange} from "../types.js"
import {Addr} from "./address.js"
import {FullTxIn, TxIn} from "./txIn.js"
import {TxOut, TxOutCandidate} from "./txOut.js"
import {Value} from "./value.js"

export type Tx = {
  hash: TxHash
  inputs: TxIn[]
  outputs: TxOut[]
  validityRange?: ValidityRange
  collateral?: TxIn[]
}

export type TxCandidate = {
  inputs: FullTxIn[]
  outputs: TxOutCandidate[]
  valueMint: Value
  changeAddr: Addr
  validityRange?: ValidityRange
  collateral?: FullTxIn[]
  ttl?: number
}

export type RawUnsignedTx = HexString

export type RawTx = HexString
