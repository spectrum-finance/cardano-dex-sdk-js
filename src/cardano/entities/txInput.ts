import {TxHash} from "../types"

export type TxInput = {
  outTxHash: TxHash
  outIndex: number
}
