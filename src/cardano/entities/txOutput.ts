import {Value} from "./value"
import {SAddr} from "./address"
import {Hash32} from "../types"

export type TxOutput = {
  value: Value
  addr: SAddr
  dataHash?: Hash32
}
