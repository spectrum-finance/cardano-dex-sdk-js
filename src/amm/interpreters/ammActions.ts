import {Addr} from "../../cardano/entities/address"
import {TxCandidate} from "../../cardano/entities/tx"
import {Value} from "../../cardano/entities/value"
import {TxContext} from "../../cardano/wallet/entities/txContext"
import {MintingAsset} from "../domain/models"
import {OrderKind, OrderRequest} from "../models/opRequests"
import {AmmOutputs} from "./ammOutputs"
import {DEFAULT_EX_UNITS_MEM, DEFAULT_EX_UNITS_STEPS} from "./refundTxBuilder/refundTxBuilder"

export interface AmmActions {
  createOrder(req: OrderRequest, ctx: TxContext): TxCandidate
}

export function mkAmmActions(outputs: AmmOutputs, uiRewardAddr: Addr): AmmActions {
  return new DefaultAmmActions(outputs, uiRewardAddr)
}

class DefaultAmmActions implements AmmActions {
  constructor(public readonly outputs: AmmOutputs, public readonly uiRewardAddr: Addr) {
  }

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

    const outputs = orderCandidate()
    if (req.uiFee > 0n) outputs.push({value: Value(req.uiFee), addr: this.uiRewardAddr})

    const mintAssets = this.getMintingAssets(req)

    return {
      inputs:         ctx.inputs,
      outputs:        outputs,
      collateral:     ctx.collateralInputs,
      changeAddr:     ctx.changeAddr,
      mintingScripts: mintAssets,
      ttl:            ctx.ttl
    }
  }

  private getMintingAssets(req: OrderRequest): MintingAsset[] {
    if (req.kind === OrderKind.PoolCreation) {

      const nftMintingData: MintingAsset = {
        amount: req.nft,
        script: req.nftMintingScript,
        exUnits: {
          mem: DEFAULT_EX_UNITS_MEM,
          steps: DEFAULT_EX_UNITS_STEPS
        }
      }

      const lqMintingData: MintingAsset = {
        amount: req.lq,
        script: req.lqMintingScript,
        exUnits: {
          mem: DEFAULT_EX_UNITS_MEM,
          steps: DEFAULT_EX_UNITS_STEPS
        }
      }

      return [nftMintingData, lqMintingData]
    } else {
      return []
    }
  }
}
