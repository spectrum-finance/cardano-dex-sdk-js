import {TxHash} from "../types"

export type Input = {
  outTxHash: TxHash
  outIndex: number
}
