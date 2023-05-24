import {Addr} from "../../entities/address.ts"
import {TxIn} from "../../entities/txIn.ts"
import {TxOut} from "../../entities/txOut.ts"

export type TxRequest = {
  inputs: TxIn[]
  outputs: TxOut[]
  changeAddr: Addr
}
