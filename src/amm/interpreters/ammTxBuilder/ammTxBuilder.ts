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

const MAX_TRANSACTION_BUILDING_TRY_COUNT = 3

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
    this.swapAmmTxBuilder = new SwapAmmTxBuilder(txMath, ammOuptuts, ammActions, inputSelector, R)
    this.redeemAmmTxBuilder = new RedeemAmmTxBuilder(txMath, ammOuptuts, ammActions, inputSelector, R)
    this.depositAmmTxBuilder = new DepositAmmTxBuilder(txMath, ammOuptuts, ammActions, inputSelector, R)
  }

  async swap(
    swapParams: SwapParams,
    currentTry = 1,
    bestTransaction?: Transaction | null,
    prevTxFee?: bigint
  ): Promise<[Transaction | null, TxCandidate, SwapTxInfo]> {
    console.log(swapParams, currentTry, bestTransaction, prevTxFee);
    if (currentTry >= MAX_TRANSACTION_BUILDING_TRY_COUNT && bestTransaction) {
      const [swapTxCandidate, swapTxInfo] = await this
        .swapAmmTxBuilder
        .build(swapParams, BigInt(bestTransaction.body().fee().to_str()))
      return [bestTransaction, swapTxCandidate, swapTxInfo]
    }

    const [swapTxCandidate, swapTxInfo] = await this.swapAmmTxBuilder.build(swapParams, prevTxFee)

    try {
      const transaction = this.txAsm.finalize(swapTxCandidate)
      const txFee = BigInt(transaction.body().fee().to_str())

      if (prevTxFee === txFee) {
        return [transaction, swapTxCandidate, swapTxInfo]
      } else {
        const newBestTxData: Transaction | null | undefined = !!prevTxFee && txFee < prevTxFee ?
          transaction :
          bestTransaction

        return this.swap(swapParams, currentTry + 1, newBestTxData, txFee)
      }
    } catch (e) {
      console.log(e)
      return [null, swapTxCandidate, {...swapTxInfo, txFee: undefined}]
    }
  }

  async redeem(
    redeemParams: RedeemParams,
    currentTry = 1,
    bestTransaction?: Transaction | null,
    prevTxFee?: bigint
  ): Promise<[Transaction | null, TxCandidate, RedeemTxInfo]> {
    if (currentTry >= MAX_TRANSACTION_BUILDING_TRY_COUNT && bestTransaction) {
      const [redeemTxCandidate, redeemTxInfo] = await this
        .redeemAmmTxBuilder
        .build(redeemParams, BigInt(bestTransaction.body().fee().to_str()))
      return [bestTransaction, redeemTxCandidate, redeemTxInfo]
    }

    const [redeemTxCandidate, redeemTxInfo] = await this.redeemAmmTxBuilder.build(redeemParams, prevTxFee)

    try {
      const transaction = this.txAsm.finalize(redeemTxCandidate)
      const txFee = BigInt(transaction.body().fee().to_str())

      if (prevTxFee === txFee) {
        return [transaction, redeemTxCandidate, redeemTxInfo]
      } else {
        const newBestTxData: Transaction | null | undefined = !!prevTxFee && txFee < prevTxFee ?
          transaction :
          bestTransaction

        return this.redeem(redeemParams, currentTry + 1, newBestTxData, txFee)
      }
    } catch (e) {
      console.log(e)
      return [null, redeemTxCandidate, {...redeemTxInfo, txFee: undefined}]
    }
  }

  async deposit(
    depositParams: DepositParams,
    currentTry = 0,
    bestTransaction?: Transaction | null,
    prevTxFee?: bigint
  ): Promise<[Transaction | null, TxCandidate, DepositTxInfo]> {
    if (currentTry >= MAX_TRANSACTION_BUILDING_TRY_COUNT && bestTransaction) {
      const [depositTxCandidate, depositTxInfo] = await this
        .depositAmmTxBuilder
        .build(depositParams, BigInt(bestTransaction.body().fee().to_str()))
      return [bestTransaction, depositTxCandidate, depositTxInfo]
    }

    const [depositTxCandidate, depositTxInfo] = await this.depositAmmTxBuilder.build(depositParams, prevTxFee)

    try {
      const transaction = this.txAsm.finalize(depositTxCandidate)
      const txFee = BigInt(transaction.body().fee().to_str())

      if (prevTxFee === txFee) {
        return [transaction, depositTxCandidate, depositTxInfo]
      } else {
        const newBestTxData: Transaction | null | undefined = !!prevTxFee && txFee < prevTxFee ?
          transaction :
          bestTransaction

        return this.deposit(depositParams, currentTry + 1, newBestTxData, txFee)
      }
    } catch (e) {
      console.log(e)
      return [null, depositTxCandidate, {...depositTxInfo, txFee: undefined}]
    }
  }
}
