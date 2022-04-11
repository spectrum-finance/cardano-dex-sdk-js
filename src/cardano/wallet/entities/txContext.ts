import {Addr} from "../../entities/address"
import {FullTxIn} from "../../entities/txIn"
import {TxOut} from "../../entities/txOut"

export type TxContext = {
  ttl: number
  inputs: FullTxIn[]
  collateralInputs: TxOut[]
  changeAddr: Addr
}
