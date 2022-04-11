import {TxOut} from "../entities/txOut"
import {Value} from "../entities/value"
import {Prover} from "./prover"

export type Paging = {
  offset: number
  limit: number
}

export interface Wallet extends Prover {
  getBalance(): Promise<Value>
  getUtxos(target: Value | undefined, paging: Paging): Promise<TxOut[]>
}
