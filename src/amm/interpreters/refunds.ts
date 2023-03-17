import {TxCandidate} from "../../cardano/entities/tx"
import {FullTxIn} from "../../cardano/entities/txIn"
import {TxOutCandidate} from "../../cardano/entities/txOut"
import {emptyValue} from "../../cardano/entities/value"
import {CardanoNetwork} from "../../quickblue/cardanoNetwork"
import {RefundParams} from "../models/refundParams"
import {OrderAddrsV1Testnet, ScriptCredsV1} from "../scripts"

export interface Refunds {
  /** Redeem assets from a proxy order box.
   */
  refund(params: RefundParams): Promise<TxCandidate>
}

const AddressesToRefund = [
  OrderAddrsV1Testnet.ammDeposit,
  OrderAddrsV1Testnet.ammSwap,
  OrderAddrsV1Testnet.ammRedeem
]

const mapRefundAddressToScript = {
  [OrderAddrsV1Testnet.ammDeposit]: ScriptCredsV1.ammDeposit,
  [OrderAddrsV1Testnet.ammSwap]:    ScriptCredsV1.ammSwap,
  [OrderAddrsV1Testnet.ammRedeem]:  ScriptCredsV1.ammRedeem
}

export class AmmOrderRefunds implements Refunds {
  constructor(public readonly network: CardanoNetwork) {
  }

  async refund(params: RefundParams): Promise<TxCandidate> {
    const tx = await this.network.getTx(params.txId)
    const outputToRefund = tx?.outputs.find(o => AddressesToRefund.includes(o.addr))

    if (outputToRefund) {
      const inputs: FullTxIn = {
        txOut:         outputToRefund,
        consumeScript: {
          // Should i set validator script or addr
          validator: mapRefundAddressToScript[outputToRefund.addr],
          redeemer:  "d8799f00000001ff",
          datum:     outputToRefund.dataHash
        }
      }

      const refundOut: TxOutCandidate = {
        addr:  params.recipientAddress,
        value: outputToRefund.value
      }

      return Promise.resolve({
        inputs:     [inputs],
        dataInputs: [],
        outputs:    [refundOut],
        valueMint:  emptyValue,
        changeAddr: params.recipientAddress
      })
    } else {
      return Promise.reject(`No AMM orders found in the given Tx{id=${params.txId}`)
    }
  }
}
