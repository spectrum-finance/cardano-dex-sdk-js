import {HexString, TxHash, ValidityRange} from "../types.ts"
import {Addr} from "./address.ts"
import {FullTxIn, TxIn} from "./txIn.ts"
import {TxOut, TxOutCandidate} from "./txOut.ts"
import {Value} from "./value.ts"

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
