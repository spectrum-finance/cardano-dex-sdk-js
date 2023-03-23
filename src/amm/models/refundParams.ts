import {FullTxIn} from "../../cardano/entities/txIn"

export type RefundParams = {
  readonly txId: string
  readonly recipientAddress: string
  readonly collateral?: FullTxIn[];
  readonly inputs: FullTxIn[];
}
