import {TxCandidate} from "../../cardano/entities/tx"
import {emptyValue, Value} from "../../cardano/entities/value"
import {Addr} from "../../cardano/types"
import {TxContext} from "../../cardano/wallet/entities/txContext"
import {OrderRequest, OrderRequestKind} from "../models/opRequests"
import {AmmOutputs} from "./ammOutputs"

export interface AmmActions {
  createOrder(req: OrderRequest, ctx: TxContext): TxCandidate
}

export function mkAmmActions(
  outputs: AmmOutputs,
  uiRewardAddr: Addr
): AmmActions {
  return new DefaultAmmActions(outputs, uiRewardAddr)
}

class DefaultAmmActions implements AmmActions {
  constructor(
    public readonly outputs: AmmOutputs,
    public readonly uiRewardAddr: Addr
  ) {}

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
    const uiFeeCandidate = {
      value: Value(req.uiFee),
      addr: this.uiRewardAddr
    }
    return {
      inputs: ctx.inputs,
      outputs: [orderCandidate(), uiFeeCandidate],
      valueMint: emptyValue,
      changeAddr: ctx.changeAddr
    }
  }
}
