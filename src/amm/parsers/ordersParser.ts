import {extractPaymentCred} from "../../cardano/entities/address"
import {FullTxOut} from "../../cardano/entities/txOut"
import {AssetAmount} from "../../domain/assetAmount"
import {CardanoWasm} from "../../utils/rustLoader"
import {parseDepositConfig, parseRedeemConfig, parseSwapConfig} from "../contractData"
import {AmmOrderInfo} from "../models/orderInfo"
import {ScriptCreds} from "../scripts"

export interface OrdersParser {
  parseOrder(out: FullTxOut): AmmOrderInfo | undefined
}

export function mkOrdersParser(creds: ScriptCreds, R: CardanoWasm): OrdersParser {
  return new DefaultOrdersParser(creds, R)
}

class DefaultOrdersParser implements OrdersParser {
  constructor(public readonly creds: ScriptCreds, public readonly R: CardanoWasm) {
  }

  parseOrder(out: FullTxOut): AmmOrderInfo | undefined {
    if ([this.creds.ammSwapDefault, this.creds.ammSwapDefault].includes(extractPaymentCred(out.addr, this.R))  && out.dataBin) {
      const swap = parseSwapConfig(out.dataBin, this.R);
      if (swap) {
        const from = new AssetAmount(swap.base, swap.baseAmount)
        return {type: "swap", poolId: swap.poolId, from, to: swap.quote, toMinAmount: swap.minQuoteAmount}
      } else {
        return undefined
      }
    } else if (extractPaymentCred(out.addr, this.R) === this.creds.ammDepositDefault && out.dataBin) {
      const deposit = parseDepositConfig(out.dataBin, this.R)
      if (deposit) {
        const inXAmount = out.value.find(
          v => v.policyId === deposit.x.policyId && v.name === deposit.x.name
        )?.quantity
        const inYAmount = out.value.find(
          v => v.policyId === deposit.y.policyId && v.name === deposit.y.name
        )?.quantity
        if (inXAmount && inYAmount) {
          const inX = new AssetAmount(deposit.x, inXAmount)
          const inY = new AssetAmount(deposit.y, inYAmount)
          return {type: "deposit", poolId: deposit.poolId, inX, inY}
        } else {
          return undefined
        }
      } else {
        return undefined
      }
    } else if (extractPaymentCred(out.addr, this.R) === this.creds.ammRedeemDefault && out.dataBin) {
      const redeem = parseRedeemConfig(out.dataBin, this.R)
      if (redeem) {
        const inLqAmount = out.value.find(
          v => v.policyId === redeem.lq.policyId && v.name === redeem.lq.name
        )?.quantity
        if (inLqAmount) {
          const inLq = new AssetAmount(redeem.lq, inLqAmount)
          return {type: "redeem", poolId: redeem.poolId, inLq}
        } else {
          return undefined
        }
      } else {
        return undefined
      }
    } else {
      return undefined
    }
  }
}
