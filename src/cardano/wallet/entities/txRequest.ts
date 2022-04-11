import {Addr} from "../../entities/address"
import {TxIn} from "../../entities/txIn"
import {TxOut} from "../../entities/txOut"

export type TxRequest = {
  inputs: TxIn[]
  outputs: TxOut[]
  changeAddr: Addr
}
