import {TxCandidate} from "../../cardano/entities/tx"
import {FullTxIn} from "../../cardano/entities/txIn"
import {TxOutCandidate} from "../../cardano/entities/txOut"
import {emptyValue} from "../../cardano/entities/value"
import {CardanoNetwork} from "../../quickblue/cardanoNetwork"
import {RefundParams} from "../models/refundParams"
import {OrderAddrsV1Testnet, ScriptCredsV1} from "../scripts"
import {AdaAssetName, AdaPolicyId} from "../../cardano/constants"

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
          validator: mapRefundAddressToScript[outputToRefund.addr],
          redeemer:  "d8799f00000001ff",
          datum:     outputToRefund.dataBin
        }
      }

      const refundOut: TxOutCandidate = {
        addr:  params.recipientAddress,
        value: outputToRefund.value.map(item => item.policyId === AdaPolicyId && item.name === AdaAssetName ?
          ({ ...item, quantity: item.quantity - (2000000 as any)  }) : item
        )
      }

      return Promise.resolve({
        inputs:     [inputs],
        dataInputs: [],
        outputs:    [refundOut],
        valueMint:  emptyValue,
        changeAddr: params.recipientAddress,
        collateral: params.collateral,
      })
    } else {
      return Promise.reject(`No AMM orders found in the given Tx{id=${params.txId}`)
    }
  }
}
