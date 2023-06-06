import {Transaction} from "@emurgo/cardano-serialization-lib-nodejs"
import {TxCandidate} from "../../../cardano/entities/tx"
import {InputSelector} from "../../../cardano/wallet/inputSelector"
import {TxAsm} from "../../../cardano/wallet/txAsm"
import {TxMath} from "../../../cardano/wallet/txMath"
import {CardanoWasm} from "../../../utils/rustLoader"
import {AmmActions} from "../ammActions"
import {AmmOutputs} from "../ammOutputs"
import {DepositAmmTxBuilder, DepositParams, DepositTxInfo} from "./depositAmmTxBuilder"
import {RedeemAmmTxBuilder, RedeemParams, RedeemTxInfo} from "./redeemAmmTxBuilder"
import {SwapAmmTxBuilder, SwapParams, SwapTxInfo} from "./swapAmmTxBuilder"

export interface AmmTxBuilder {
  swap(params: SwapParams): Promise<[Transaction | null, TxCandidate, SwapTxInfo]>;
  redeem(params: RedeemParams): Promise<[Transaction | null, TxCandidate, RedeemTxInfo]>;
  deposit(params: DepositParams): Promise<[Transaction | null, TxCandidate, DepositTxInfo]>;
}

const MAX_TRANSACTION_BUILDING_TRY_COUNT = 3;

export class DefaultAmmTxCandidateBuilder implements AmmTxBuilder {
  private swapAmmTxBuilder: SwapAmmTxBuilder

  private redeemAmmTxBuilder: RedeemAmmTxBuilder

  private depositAmmTxBuilder: DepositAmmTxBuilder

  constructor(
    txMath: TxMath,
    ammOuptuts: AmmOutputs,
    ammActions: AmmActions,
    inputSelector: InputSelector,
    R: CardanoWasm,
    private txAsm: TxAsm
  ) {
    this.swapAmmTxBuilder = new SwapAmmTxBuilder(txMath, ammOuptuts, ammActions, inputSelector, R);
    this.redeemAmmTxBuilder = new RedeemAmmTxBuilder(txMath, ammOuptuts, ammActions, inputSelector, R);
    this.depositAmmTxBuilder = new DepositAmmTxBuilder(txMath, ammOuptuts, ammActions, inputSelector, R);
  }

  async swap(
    swapParams: SwapParams,
    currentTry = 0,
    bestTxData?: [Transaction | null, TxCandidate, SwapTxInfo],
    prevTxFee?: bigint
  ): Promise<[Transaction | null, TxCandidate, SwapTxInfo]> {
    if (currentTry >= MAX_TRANSACTION_BUILDING_TRY_COUNT && bestTxData) {
      return bestTxData
    }

    const [swapTxCandidate, swapTxInfo] = await this.swapAmmTxBuilder.build(swapParams, prevTxFee)

    try {
      const transaction = this.txAsm.finalize(swapTxCandidate)
      const txFee = BigInt(transaction.body().fee().to_str())

      if (prevTxFee === txFee) {
        return [transaction, swapTxCandidate, swapTxInfo]
      } else {
        const newBestTxData: [Transaction | null, TxCandidate, SwapTxInfo] | undefined = !!prevTxFee && txFee < prevTxFee ?
          [transaction, swapTxCandidate, swapTxInfo] :
          bestTxData
        console.log('new:', newBestTxData);
        console.log('old:', bestTxData);
        console.log(prevTxFee, txFee);

        return this.swap(swapParams, currentTry + 1, newBestTxData, txFee)
      }
    } catch (e) {
      console.log(e);
      return [null, swapTxCandidate, { ...swapTxInfo, txFee: undefined }];
    }
  }

  async redeem(
    redeemParams: RedeemParams,
    currentTry = 0,
    bestTxData?: [Transaction | null, TxCandidate, RedeemTxInfo],
    prevTxFee?: bigint
  ): Promise<[Transaction | null, TxCandidate, RedeemTxInfo]> {
    if (currentTry >= MAX_TRANSACTION_BUILDING_TRY_COUNT && bestTxData) {
      return bestTxData
    }

    const [redeemTxCandidate, redeemTxInfo] = await this.redeemAmmTxBuilder.build(redeemParams, prevTxFee)

    try {
      const transaction = this.txAsm.finalize(redeemTxCandidate)
      const txFee = BigInt(transaction.body().fee().to_str())

      if (prevTxFee === txFee) {
        return [transaction, redeemTxCandidate, redeemTxInfo]
      } else {
        const newBestTxData: [Transaction | null, TxCandidate, RedeemTxInfo] | undefined = !!prevTxFee && txFee < prevTxFee ?
          [transaction, redeemTxCandidate, redeemTxInfo] :
          bestTxData

        return this.redeem(redeemParams, currentTry + 1, newBestTxData, txFee)
      }
    } catch (e) {
      console.log(e);
      return [null, redeemTxCandidate, { ...redeemTxInfo, txFee: undefined }];
    }
  }

  async deposit(
    depositParams: DepositParams,
    currentTry = 0,
    bestTxData?: [Transaction | null, TxCandidate, DepositTxInfo],
    prevTxFee?: bigint
  ): Promise<[Transaction | null, TxCandidate, DepositTxInfo]> {
    if (currentTry >= MAX_TRANSACTION_BUILDING_TRY_COUNT && bestTxData) {
      return bestTxData
    }

    const [depositTxCandidate, depositTxInfo] = await this.depositAmmTxBuilder.build(depositParams, prevTxFee)

    try {
      const transaction = this.txAsm.finalize(depositTxCandidate)
      const txFee = BigInt(transaction.body().fee().to_str())

      if (prevTxFee === txFee) {
        return [transaction, depositTxCandidate, depositTxInfo]
      } else {
        const newBestTxData: [Transaction | null, TxCandidate, DepositTxInfo] | undefined = !!prevTxFee && txFee < prevTxFee ?
          [transaction, depositTxCandidate, depositTxInfo] :
          bestTxData

        return this.deposit(depositParams, currentTry + 1, newBestTxData, txFee)
      }
    } catch (e) {
      console.log(e);
      return [null, depositTxCandidate, { ...depositTxInfo, txFee: undefined }];
    }
  }
}
