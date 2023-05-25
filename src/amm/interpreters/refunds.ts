import {AdaAssetName, AdaPolicyId} from "../../cardano/constants.js"
import {TxCandidate} from "../../cardano/entities/tx.js"
import {FullTxIn} from "../../cardano/entities/txIn.js"
import {TxOutCandidate} from "../../cardano/entities/txOut.js"
import {emptyValue} from "../../cardano/entities/value.js"
import {CardanoNetwork} from "../../quickblue/cardanoNetwork.js"
import {RefundParams} from "../models/refundParams.js"
import {OpInRefsV1, OrderAddrsV1Testnet, ScriptCredsV1} from "../scripts.js"

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
  [OrderAddrsV1Testnet.ammSwap]: ScriptCredsV1.ammSwap,
  [OrderAddrsV1Testnet.ammRedeem]: ScriptCredsV1.ammRedeem
}

const mapRefundAddressToOpInRef = {
  [OrderAddrsV1Testnet.ammDeposit]: OpInRefsV1.ammDeposit,
  [OrderAddrsV1Testnet.ammSwap]: OpInRefsV1.ammSwap,
  [OrderAddrsV1Testnet.ammRedeem]: OpInRefsV1.ammRedeem
}

export class AmmOrderRefunds implements Refunds {
  constructor(public readonly network: CardanoNetwork) {}

  async refund(params: RefundParams): Promise<TxCandidate> {
    const tx = await this.network.getTx(params.txId)
    const outputToRefund = tx?.outputs.find((o: any) => AddressesToRefund.includes(o.addr))

    if (outputToRefund) {
      const input: FullTxIn = {
        txOut: outputToRefund,
        consumeScript: {
          validator: mapRefundAddressToScript[outputToRefund.addr],
          redeemer: "d8799f00000001ff",
          datum: outputToRefund.dataBin,
          opInRef: mapRefundAddressToOpInRef[outputToRefund.addr]
        }
      }

      const refundOut: TxOutCandidate = {
        addr: params.recipientAddress,
        value: outputToRefund.value.map((item: any) =>
          item.policyId === AdaPolicyId && item.name === AdaAssetName
            ? // TODO: FIX Type and value missmatches
              {...item, quantity: item.quantity - (Number(params.fee) as any)}
            : item
        )
      }

      return Promise.resolve({
        inputs: [input],
        dataInputs: [],
        outputs: [refundOut],
        valueMint: emptyValue,
        changeAddr: params.recipientAddress,
        collateral: params.collateral
      })
    } else {
      return Promise.reject(`No AMM orders found in the given Tx{id=${params.txId}`)
    }
  }
}
