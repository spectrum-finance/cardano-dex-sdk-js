import {CreateRequest, OrderRequest, OrderRequestKind} from "../models/opRequests"
import {TxContext} from "../../cardano/wallet/entities/txContext"
import {TxHash} from "../../cardano/types"
import {notImplemented} from "../../utils/notImplemented"
import {AmmOutputs} from "./ammOutputs"
import {SAddr} from "../../cardano/entities/address"
import {Value} from "../../cardano/entities/value"

export interface AmmActions {
  create(req: CreateRequest, ctx: TxContext): Promise<TxHash[]>
  order(req: OrderRequest, ctx: TxContext): Promise<TxHash>
}

export class AmmActionsImpl implements AmmActions {
  constructor(public readonly outputs: AmmOutputs, public readonly uiRewardAddr: SAddr) {}

  create(req: CreateRequest, ctx: TxContext): Promise<TxHash[]> {
    return notImplemented([req, ctx])
  }

  order(req: OrderRequest, ctx: TxContext): Promise<TxHash> {
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
    return notImplemented([orderCandidate(), uiFeeCandidate, ctx])
  }
}
