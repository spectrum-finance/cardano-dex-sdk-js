import {Addr} from "../../entities/address"
import {FullTxIn} from "../../entities/txIn"
import {TxOut} from "../../entities/txOut"

export type TxContext = {
  inputs: FullTxIn[]
  collateralInputs: TxOut[]
  changeAddr: Addr
  ttl?: number
}
