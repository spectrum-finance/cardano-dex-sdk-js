import {TxInput} from "./txInput"
import {TxOutput} from "./txOutput"
import {Slot} from "../types"

export type TxBody = {
  inputs: TxInput[]
  outputs: TxOutput[]
  ttl?: Slot
  collateral?: TxInput[]
}
