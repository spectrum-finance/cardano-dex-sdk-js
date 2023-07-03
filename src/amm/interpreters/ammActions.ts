import {Addr} from "../../cardano/entities/address"
import {TxCandidate} from "../../cardano/entities/tx"
import {emptyValue, Value} from "../../cardano/entities/value"
import {TxContext} from "../../cardano/wallet/entities/txContext"
import {OrderKind, OrderRequest} from "../models/opRequests"
import {AmmOutputs} from "./ammOutputs"
import {TxOutCandidate} from "../../cardano/entities/txOut";
import {MintingAsset} from "../domain/models";

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
        case OrderKind.PoolCreation:
          return this.outputs.poolCreation(req)
      }
    }

    const outputs = [orderCandidate()]
    if (req.uiFee > 0n) outputs.push({value: Value(req.uiFee), addr: this.uiRewardAddr})

    const [mintValue, mintAssets] = this.getMintingData(req)

    return {
      inputs: ctx.inputs,
      outputs: outputs,
      valueMint: mintValue,
      changeAddr: ctx.changeAddr,
      mintingScripts: mintAssets,
      ttl: ctx.ttl
    }
  }

  private getMintingData(req: OrderRequest): [Value, MintingAsset[]] {
    if (req.kind === OrderKind.PoolCreation) {

      const nftMintingData = {
        amount: req.nft,
        script: req.nftMintingScript
      }

      const lqMintingData = {
        amount: req.lq,
        script: req.lqMintingScript
      }

      return [Value(0n, [req.nft, req.lq]), [nftMintingData, lqMintingData]]
    } else {
      return [emptyValue, []]
    }
  }
}
