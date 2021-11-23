import {Slot} from "../types"
import {Input} from "./input"
import {Output} from "./output"

export type TxBody = {
  inputs: Input[]
  outputs: Output[]
  ttl?: Slot
  collateral?: Input[]
}

export type Tx = {
  body: TxBody
}
