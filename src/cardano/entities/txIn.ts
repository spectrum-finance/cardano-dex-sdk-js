import {Datum, Redeemer, Script, TxHash} from "../types"
import {TxOut} from "./txOut"

export type TxIn = {
  outTxHash: TxHash
  outIndex: number
}

export type OperationInRef = {
  opInRefHash: TxHash;
  opInRefIndex: number;
}

export type ConsumeScriptInput = {
  validator: Script;
  redeemer: Redeemer;
  datum?: Datum
  opInRef: OperationInRef;
  mem: string;
  steps: string;
}

export type FullTxIn = {
  txOut: TxOut
  consumeScript?: ConsumeScriptInput
}
