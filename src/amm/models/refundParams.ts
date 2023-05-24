import {FullTxIn} from "../../cardano/entities/txIn.ts"

export type RefundParams = {
  readonly txId: string
  readonly recipientAddress: string
  readonly collateral?: FullTxIn[]
  readonly fee: BigInt
}
