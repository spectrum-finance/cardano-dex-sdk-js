import {Input} from "../../entities/input"
import {Output} from "../../entities/output"
import {SAddr} from "../../entities/address"

export type TxRequest = {
  inputs: Input[]
  outputs: Output[]
  changeAddr: SAddr
}
