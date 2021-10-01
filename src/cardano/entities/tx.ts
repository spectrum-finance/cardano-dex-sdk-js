import {Input} from "./input"
import {Output} from "./output"
import {Slot} from "../types"

export type TxBody = {
  inputs: Input[]
  outputs: Output[]
  ttl?: Slot
  collateral?: Input[]
}

export type Tx = {
  body: TxBody
}
