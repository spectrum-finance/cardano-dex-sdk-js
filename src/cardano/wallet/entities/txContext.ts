import {SAddr} from "../../entities/address"
import {TxOut} from "../../entities/txOut"

export type TxContext = {
  ttl: number
  inputs: TxOut[]
  collateralInputs: TxOut[]
  changeAddr: SAddr
}
