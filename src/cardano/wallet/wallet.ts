import {TxOut} from "../entities/txOut.ts"
import {Value} from "../entities/value.ts"
import {Prover} from "./prover.ts"

export type Paging = {
  offset: number
  limit: number
}

export interface Wallet extends Prover {
  getBalance(): Promise<Value>
  getUtxos(target: Value | undefined, paging: Paging): Promise<TxOut[]>
}
