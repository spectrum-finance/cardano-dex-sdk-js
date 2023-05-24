import {Addr} from "../../cardano/entities/address.ts"
import {TxCandidate} from "../../cardano/entities/tx.ts"
import {emptyValue, Value} from "../../cardano/entities/value.ts"
import {TxContext} from "../../cardano/wallet/entities/txContext.ts"
import {OrderKind, OrderRequest} from "../models/opRequests.ts"
import {AmmOutputs} from "./ammOutputs.ts"

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
