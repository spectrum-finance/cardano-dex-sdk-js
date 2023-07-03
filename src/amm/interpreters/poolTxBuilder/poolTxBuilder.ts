import {AssetAmount} from "../../../domain/assetAmount";
import {TxCandidate} from "../../../cardano/entities/tx";
import {SwapParams, SwapTxInfo} from "../ammTxBuilder/swapAmmTxBuilder";
import {PoolCreationParams} from "../../math/pool";

export class PoolCreationBuilder {
  async build(params: PoolCreationParams, userTxFee?: bigint): Promise<[TxCandidate, SwapTxInfo]> {
    undefined
  }
}
