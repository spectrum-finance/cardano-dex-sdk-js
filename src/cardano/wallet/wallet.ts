import {TxOut} from "../entities/txOut.js"
import {Value} from "../entities/value.js"
import {Prover} from "./prover.js"

export type Paging = {
  offset: number
  limit: number
}

export interface Wallet extends Prover {
  getBalance(): Promise<Value>
  getUtxos(target: Value | undefined, paging: Paging): Promise<TxOut[]>
}
