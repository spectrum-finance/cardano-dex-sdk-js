import {mkTxOutRef, PaymentCred} from "../../cardano/types"
import {CardanoNetwork} from "../../quickblue/cardanoNetwork"
import {QuickblueTx, QuickblueTxIn, QuickblueTxOut} from "../../quickblue/models"
import {CardanoWasm} from "../../utils/rustLoader"
import {parseOrderRedeemer} from "../contractData"
import {AmmDexOperation} from "../models/operations"
import {AmmOrderInfo} from "../models/orderInfo"
import {OrdersParser} from "../parsers/ordersParser"

const MAX_PENDING_INTERVAL = 10 * 60_000;

export interface History {
  getAllByPCreds(creds: PaymentCred[], displayLatest: number): Promise<AmmDexOperation[]>
}

export function mkHistory(parser: OrdersParser, network: CardanoNetwork, R: CardanoWasm): History {
  return new NetworkHistory(parser, network, R)
}

class NetworkHistory implements History {
  constructor(
    public readonly parser: OrdersParser,
    public readonly network: CardanoNetwork,
    public readonly R: CardanoWasm
  ) {}
  async getAllByPCreds(creds: PaymentCred[], displayLatest: number): Promise<AmmDexOperation[]> {
    const ops: AmmDexOperation[] = []
    for (const cred of creds) {
      const limit = 100
      let offset = 0
      while (ops.length < displayLatest) {
        const txs = await this.network.getTxsByPaymentCred(cred, {offset, limit})
        for (const tx of txs) {
          const op = this.parseOp(tx);
          if (op) ops.push(op)
        }
        if (txs.length > 0) offset += limit
        else break
      }
    }
    return ops
  }

  private parseOp(tx: QuickblueTx): AmmDexOperation | undefined {
    const orderInInputs = tx.inputs.reduceRight((acc, i) => {
      if (!acc) {
        const op = this.parser.parseOrder(i.out)
        return op ? ([op, i] as [AmmOrderInfo, QuickblueTxIn]) : undefined
      } else {
        return acc
      }
    }, undefined as [AmmOrderInfo, QuickblueTxIn] | undefined)
    const orderInOutputs = tx.outputs.reduceRight((acc, o) => {
      if (!acc) {
        const op = this.parser.parseOrder(o)
        return op ? ([op, o] as [AmmOrderInfo, QuickblueTxOut]) : undefined
      } else {
        return acc
      }
    }, undefined as [AmmOrderInfo, QuickblueTxOut] | undefined)
    if (orderInInputs) {
      const [summary, input] = orderInInputs
      const redeemerData = input.redeemer?.dataBin
      const action = redeemerData ? parseOrderRedeemer(redeemerData, this.R) : undefined
      if (action === "refund") {
        return {type: "refund", height: tx.blockIndex, txHash: tx.hash, status: "confirmed", order: summary, timestamp: tx.timestamp * 1_000}
      }
      return undefined;
    } else if (orderInOutputs) {
      const [summary, output] = orderInOutputs
      const timestamp = tx.timestamp * 1_000;

      if (output.spentByTxHash) {
        return {
          type: "order",
          height: tx.blockIndex,
          txHash: tx.hash,
          outRef: mkTxOutRef(output.txHash, output.index),
          status: "executed",
          timestamp,
          order: summary
        }
      } else if (Date.now() - timestamp >= MAX_PENDING_INTERVAL) {
        return {
          type: "order",
          height: tx.blockIndex,
          txHash: tx.hash,
          outRef: mkTxOutRef(output.txHash, output.index),
          status: "pending",
          timestamp,
          order: summary
        }
      }
      return {
        type: "order",
        height: tx.blockIndex,
        txHash: tx.hash,
        outRef: mkTxOutRef(output.txHash, output.index),
        status: "locked",
        timestamp,
        order: summary
      }
    } else {
      return undefined
    }
  }
}
