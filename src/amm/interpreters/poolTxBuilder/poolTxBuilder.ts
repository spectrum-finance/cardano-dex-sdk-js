import {AssetAmount} from "../../../domain/assetAmount";
import {TxCandidate} from "../../../cardano/entities/tx";
import {SwapParams, SwapTxInfo} from "../ammTxBuilder/swapAmmTxBuilder";

export interface PoolCreationParams {
  readonly x: AssetAmount
  readonly y: AssetAmount
  readonly ada?: AssetAmount
  readonly nft: AssetAmount
  readonly lq: AssetAmount
}

export class PoolCreationBuilder {
  async build(params: PoolCreationParams, userTxFee?: bigint): Promise<[TxCandidate, SwapTxInfo]> {
    undefined
  }
}
