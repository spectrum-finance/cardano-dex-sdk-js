import {Addr} from "../../entities/address.js"
import {FullTxIn} from "../../entities/txIn.js"
import {TxOut} from "../../entities/txOut.js"

export type TxContext = {
  inputs: FullTxIn[]
  collateralInputs: TxOut[]
  changeAddr: Addr
  ttl?: number
}
