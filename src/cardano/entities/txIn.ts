import {Datum, Redeemer, Script, TxHash} from "../types.ts"
import {TxOut} from "./txOut.ts"

export type TxIn = {
  outTxHash: TxHash
  outIndex: number
}

export type OperationInRef = {
  opInRefHash: TxHash
  opInRefIndex: number
}

export type ConsumeScriptInput = {
  validator: Script
  redeemer: Redeemer
  datum?: Datum
  opInRef: OperationInRef
}

export type FullTxIn = {
  txOut: TxOut
  consumeScript?: ConsumeScriptInput
}
