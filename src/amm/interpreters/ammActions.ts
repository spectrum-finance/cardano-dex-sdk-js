import {Addr} from "../../cardano/entities/address.js"
import {TxCandidate} from "../../cardano/entities/tx.js"
import {emptyValue, Value} from "../../cardano/entities/value.js"
import {TxContext} from "../../cardano/wallet/entities/txContext.js"
import {OrderKind, OrderRequest} from "../models/opRequests.js"
import {AmmOutputs} from "./ammOutputs.js"

export interface AmmActions {
  createOrder(req: OrderRequest, ctx: TxContext): TxCandidate
}

export function mkAmmActions(outputs: AmmOutputs, uiRewardAddr: Addr): AmmActions {
  return new DefaultAmmActions(outputs, uiRewardAddr)
}

class DefaultAmmActions implements AmmActions {
  constructor(public readonly outputs: AmmOutputs, public readonly uiRewardAddr: Addr) {}

  createOrder(req: OrderRequest, ctx: TxContext): TxCandidate {
    const orderCandidate = () => {
      switch (req.kind) {
        case OrderKind.Deposit:
          return this.outputs.deposit(req)
        case OrderKind.Redeem:
          return this.outputs.redeem(req)
        case OrderKind.Swap:
          return this.outputs.swap(req)
      }
    }

    const outputs = [orderCandidate()]
    if (req.uiFee > 0n) outputs.push({value: Value(req.uiFee), addr: this.uiRewardAddr})

    return {
      inputs: ctx.inputs,
      outputs: outputs,
      valueMint: emptyValue,
      changeAddr: ctx.changeAddr,
      ttl: ctx.ttl
    }
  }
}
