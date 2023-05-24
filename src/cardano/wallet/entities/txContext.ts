import {Addr} from "../../entities/address.ts"
import {FullTxIn} from "../../entities/txIn.ts"
import {TxOut} from "../../entities/txOut.ts"

export type TxContext = {
  inputs: FullTxIn[]
  collateralInputs: TxOut[]
  changeAddr: Addr
  ttl?: number
}
