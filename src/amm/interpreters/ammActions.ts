import {Addr} from "../../cardano/entities/address"
import {TxCandidate} from "../../cardano/entities/tx"
import {emptyValue, Value} from "../../cardano/entities/value"
import {TxContext} from "../../cardano/wallet/entities/txContext"
import {OrderRequest, OrderRequestKind} from "../models/opRequests"
import {AmmOutputs} from "./ammOutputs"

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
        case OrderRequestKind.Deposit:
          return this.outputs.deposit(req)
        case OrderRequestKind.Redeem:
          return this.outputs.redeem(req)
        case OrderRequestKind.Swap:
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
