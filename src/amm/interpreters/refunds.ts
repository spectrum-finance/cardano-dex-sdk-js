import {AdaAssetName, AdaPolicyId} from "../../cardano/constants"
import {TxCandidate} from "../../cardano/entities/tx"
import {FullTxIn} from "../../cardano/entities/txIn"
import {TxOutCandidate} from "../../cardano/entities/txOut"
import {emptyValue} from "../../cardano/entities/value"
import {CardanoNetwork} from "../../quickblue/cardanoNetwork"
import {RefundParams} from "../models/refundParams"
import {
  OpInRefsMainnetV1,
  OpInRefsPreviewV1,
  OrderAddrsV1Mainnet,
  OrderAddrsV1Testnet,
  ScriptCredsV1
} from "../scripts"
import {DEFAULT_EX_UNITS_MEM, DEFAULT_EX_UNITS_STEPS} from "./refundTxBuilder/refundTxBuilder"

export interface Refunds {
  /** Redeem assets from a proxy order box.
   */
  refund(params: RefundParams): Promise<TxCandidate>
}

const AddressesToRefund = [
  OrderAddrsV1Testnet.ammDeposit,
  OrderAddrsV1Testnet.ammSwap,
  OrderAddrsV1Testnet.ammRedeem,

  OrderAddrsV1Mainnet.ammDeposit,
  OrderAddrsV1Mainnet.ammSwap,
  OrderAddrsV1Mainnet.ammRedeem,
]

const mapRefundAddressToScript = {
  [OrderAddrsV1Testnet.ammDeposit]: ScriptCredsV1.ammDeposit,
  [OrderAddrsV1Testnet.ammSwap]:    ScriptCredsV1.ammSwap,
  [OrderAddrsV1Testnet.ammRedeem]:  ScriptCredsV1.ammRedeem,

  [OrderAddrsV1Mainnet.ammDeposit]: ScriptCredsV1.ammDeposit,
  [OrderAddrsV1Mainnet.ammSwap]:    ScriptCredsV1.ammSwap,
  [OrderAddrsV1Mainnet.ammRedeem]:  ScriptCredsV1.ammRedeem
}

const mapRefundAddressToOpInRef = {
  [OrderAddrsV1Testnet.ammDeposit]: OpInRefsPreviewV1.ammDeposit,
  [OrderAddrsV1Testnet.ammSwap]:    OpInRefsPreviewV1.ammSwap,
  [OrderAddrsV1Testnet.ammRedeem]:  OpInRefsPreviewV1.ammRedeem,

  [OrderAddrsV1Mainnet.ammDeposit]: OpInRefsMainnetV1.ammDeposit,
  [OrderAddrsV1Mainnet.ammSwap]:    OpInRefsMainnetV1.ammSwap,
  [OrderAddrsV1Mainnet.ammRedeem]:  OpInRefsMainnetV1.ammRedeem
}

export class AmmOrderRefunds implements Refunds {
  constructor(public readonly network: CardanoNetwork) {
  }

  async refund(params: RefundParams): Promise<TxCandidate> {
    const tx = await this.network.getTx(params.txId)
    const outputToRefund = tx?.outputs.find(o => AddressesToRefund.includes(o.addr))

    if (outputToRefund) {
      const input: FullTxIn = {
        txOut:         outputToRefund,
        consumeScript: {
          validator: mapRefundAddressToScript[outputToRefund.addr],
          redeemer:  "d8799f00000001ff",
          datum:     outputToRefund.dataBin,
          opInRef:   mapRefundAddressToOpInRef[outputToRefund.addr],
          mem: DEFAULT_EX_UNITS_MEM,
          steps: DEFAULT_EX_UNITS_STEPS
        }
      }

      const refundOut: TxOutCandidate = {
        addr:  params.recipientAddress,
        value: outputToRefund.value.map(item => item.policyId === AdaPolicyId && item.name === AdaAssetName ?
          // TODO: FIX Type and value missmatches
          ({...item, quantity: item.quantity - (Number(params.fee) as any)}) : item
        )
      }

      return Promise.resolve({
        inputs:     [input],
        dataInputs: [],
        outputs:    [refundOut],
        valueMint:  emptyValue,
        changeAddr: params.recipientAddress,
        collateral: params.collateral
      })
    } else {
      return Promise.reject(`No AMM orders found in the given Tx{id=${params.txId}`)
    }
  }
}
