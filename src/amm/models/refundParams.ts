import {FullTxIn} from "../../cardano/entities/txIn.js"

export type RefundParams = {
  readonly txId: string
  readonly recipientAddress: string
  readonly collateral?: FullTxIn[]
  readonly fee: BigInt
}
