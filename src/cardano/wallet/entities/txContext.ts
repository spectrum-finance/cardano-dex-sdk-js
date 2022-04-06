import {FullTxIn} from "../../entities/txIn"
import {TxOut} from "../../entities/txOut"
import {Addr} from "../../types"

export type TxContext = {
  ttl: number
  inputs: FullTxIn[]
  collateralInputs: TxOut[]
  changeAddr: Addr
}
