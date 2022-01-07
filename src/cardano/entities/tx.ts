import {TxHash, ValidityRange} from "../types"
import {TxIn} from "./txIn"
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
  inputs: TxIn[]
  outputs: TxOutCandidate[]
  valueMint: Value
  validityRange?: ValidityRange
  collateral?: TxIn[]
}
