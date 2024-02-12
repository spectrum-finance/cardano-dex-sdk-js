import {Addr} from "../../entities/address"
import {FullTxIn} from "../../entities/txIn"

export type TxContext = {
  inputs: FullTxIn[]
  collateralInputs: FullTxIn[]
  totalCollateral?: bigint;
  changeAddr: Addr
  ttl?: number
}
