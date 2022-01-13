import {SAddr} from "../../cardano/entities/address"
import {RawTx} from "../../cardano/entities/rawTx"
import {emptyValue, Value} from "../../cardano/entities/value"
import {TxContext} from "../../cardano/wallet/entities/txContext"
import {Prover} from "../../cardano/wallet/prover"
import {TxAsm} from "../../cardano/wallet/txAsm"
import {notImplemented} from "../../utils/notImplemented"
import {CreateRequest, OrderRequest, OrderRequestKind} from "../models/opRequests"
import {AmmOutputs} from "./ammOutputs"

export interface AmmActions {
  createPool(req: CreateRequest, ctx: TxContext): Promise<RawTx[]>
  createOrder(req: OrderRequest, ctx: TxContext): Promise<RawTx>
}

export function mkAmmActions(
  asm: TxAsm,
  prover: Prover,
  outputs: AmmOutputs,
  uiRewardAddr: SAddr
): AmmActions {
  return new DefaultAmmActions(asm, prover, outputs, uiRewardAddr)
}

class DefaultAmmActions implements AmmActions {
  constructor(
    public readonly asm: TxAsm,
    public readonly prover: Prover,
    public readonly outputs: AmmOutputs,
    public readonly uiRewardAddr: SAddr
  ) {}

  createPool(req: CreateRequest, ctx: TxContext): Promise<RawTx[]> {
    return notImplemented([req, ctx])
  }

  createOrder(req: OrderRequest, ctx: TxContext): Promise<RawTx> {
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
    const txc = {
      inputs: ctx.inputs,
      outputs: [orderCandidate(), uiFeeCandidate],
      valueMint: emptyValue,
      changeAddr: ctx.changeAddr
    }
    return this.prover.sign(this.asm.finalize(txc))
  }
}
