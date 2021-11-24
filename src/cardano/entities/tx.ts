import {TxHash, ValidityRange} from "../types"
import {TxIn} from "./txIn"
import {TxOut} from "./txOut"
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
  outputs: TxOut[]
  valueMint: Value
  validityRange?: ValidityRange
  collateral?: TxIn[]
}
