import {TxIn} from "../../entities/txIn"
import {TxOut} from "../../entities/txOut"
import {SAddr} from "../../entities/address"

export type TxRequest = {
  inputs: TxIn[]
  outputs: TxOut[]
  changeAddr: SAddr
}
