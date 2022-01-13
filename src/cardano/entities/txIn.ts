import {Datum, Redeemer, Script, TxHash} from "../types"
import {TxOut} from "./txOut"

export type TxIn = {
  outTxHash: TxHash
  outIndex: number
}

export type ConsumeScriptInput = {
  validator: Script
  redeemer: Redeemer
  datum?: Datum
}

export type FullTxIn = {
  txOut: TxOut
  consumeScript?: ConsumeScriptInput
}
