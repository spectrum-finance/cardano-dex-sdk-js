import {TxHash} from "../types"

export type TxIn = {
  outTxHash: TxHash
  outIndex: number
}
