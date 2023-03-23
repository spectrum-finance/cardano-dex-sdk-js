import {HexString, TxHash, ValidityRange} from "../types"
import {Addr} from "./address"
import {FullTxIn, TxIn} from "./txIn"
import {TxOut, TxOutCandidate} from "./txOut"
import {Value} from "./value"

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
