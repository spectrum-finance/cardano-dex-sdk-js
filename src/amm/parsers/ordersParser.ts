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
  constructor(public readonly creds: ScriptCreds, public readonly R: CardanoWasm) {}
  parseOrder(out: FullTxOut): AmmOrderInfo | undefined {
    if (out.addr === this.creds.ammSwap && out.data) {
      const swap = parseSwapConfig(out.data, this.R)
      if (swap) {
        const from = new AssetAmount(swap.base, swap.baseAmount)
        return {type: "swap", poolId: swap.poolId, from, to: swap.quote, toMinAmount: swap.minQuoteAmount}
      } else {
        return undefined
      }
    } else if (out.addr === this.creds.ammDeposit && out.data) {
      const deposit = parseDepositConfig(out.data, this.R)
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
    } else if (out.addr === this.creds.ammRedeem && out.data) {
      const redeem = parseRedeemConfig(out.data, this.R)
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
