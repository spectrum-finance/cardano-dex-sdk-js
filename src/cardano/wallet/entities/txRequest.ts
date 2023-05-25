import {Addr} from "../../entities/address.js"
import {TxIn} from "../../entities/txIn.js"
import {TxOut} from "../../entities/txOut.js"

export type TxRequest = {
  inputs: TxIn[]
  outputs: TxOut[]
  changeAddr: Addr
}
