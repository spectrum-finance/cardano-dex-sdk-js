import {Transaction} from "@emurgo/cardano-serialization-lib-nodejs"
import {TxCandidate} from "../../../cardano/entities/tx"
import {InputSelector} from "../../../cardano/wallet/inputSelector"
import {TxAsm} from "../../../cardano/wallet/txAsm"
import {TxMath} from "../../../cardano/wallet/txMath"
import {CardanoWasm} from "../../../utils/rustLoader"
import {AmmActions} from "../ammActions"
import {AmmOutputs} from "../ammOutputs"
import {SwapAmmTxBuilder, SwapParams} from "./swapAmmTxBuilder"
import {TxInfo} from "./txInfo"

export interface AmmTxBuilder {
  swap(params: SwapParams): Promise<[Transaction | null, TxCandidate, TxInfo]>
}

export class DefaultAmmTxCandidateBuilder implements AmmTxBuilder {
  private swapAmmTxBuilder: SwapAmmTxBuilder

  constructor(
    txMath: TxMath,
    ammOuptuts: AmmOutputs,
    ammActions: AmmActions,
    inputSelector: InputSelector,
    R: CardanoWasm,
    private txAsm: TxAsm
  ) {
    this.swapAmmTxBuilder = new SwapAmmTxBuilder(txMath, ammOuptuts, ammActions, inputSelector, R)
  }

  async swap(swapParams: SwapParams, prevTxFee?: bigint): Promise<[Transaction | null, TxCandidate, TxInfo]> {
    const [swapTxCandidate, swapTxInfo] = await this.swapAmmTxBuilder.build(swapParams, prevTxFee)

    try {
      const transaction = this.txAsm.finalize(swapTxCandidate)
      const txFee = BigInt(transaction.body().fee().to_str())

      if (prevTxFee === txFee) {
        return [transaction, swapTxCandidate, swapTxInfo]
      } else {
        return this.swap(swapParams, txFee)
      }
    } catch (e) {
      console.log(e);
      return [null, swapTxCandidate, swapTxInfo];
    }
  }
}
