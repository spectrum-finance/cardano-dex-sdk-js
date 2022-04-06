import {TxIn} from "../../entities/txIn"
import {TxOut} from "../../entities/txOut"
import {Addr} from "../../types"

export type TxRequest = {
  inputs: TxIn[]
  outputs: TxOut[]
  changeAddr: Addr
}
