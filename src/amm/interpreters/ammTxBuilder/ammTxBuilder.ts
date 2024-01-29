import {Transaction} from "@emurgo/cardano-serialization-lib-nodejs"
import {TxCandidate} from "../../../cardano/entities/tx"
import {InputCollector, InputSelector} from "../../../cardano/wallet/inputSelector"
import {TxAsm} from "../../../cardano/wallet/txAsm"
import {TxMath} from "../../../cardano/wallet/txMath"
import {CardanoWasm} from "../../../utils/rustLoader"
import {AmmActions} from "../ammActions"
import {AmmOutputs} from "../ammOutputs"
import {DepositAmmTxBuilder, DepositParams, DepositTxInfo} from "./depositAmmTxBuilder"
import {PoolCreationParams, PoolCreationTxBuilder, PoolCreationTxInfo} from "./poolCreationTxBuilder";
import {RedeemAmmTxBuilder, RedeemParams, RedeemTxInfo} from "./redeemAmmTxBuilder"
import {SwapAmmTxBuilder, SwapParams, SwapTxInfo} from "./swapAmmTxBuilder"
import {FullTxIn} from "../../../cardano/entities/txIn"
import {CollateralSelector} from "../../../cardano/wallet/collateralSelector"
import {LockParams, LockTxBuilder, LockTxInfo} from "./lockTxBuilder"
import {UnlockParams, UnlockTxBuilder, UnlockTxInfo} from "./unlockTxBuilder"
import {OrderAddrs, ScriptCreds} from "../../scripts"
import {ProtocolParams} from "../../../cardano/entities/env"
import {CardanoNetwork} from "../../../quickblue/cardanoNetwork"

export interface AmmTxBuilder {
  swap(params: SwapParams): Promise<[Transaction | null, TxCandidate, SwapTxInfo, Error | null]>;

  redeem(params: RedeemParams): Promise<[Transaction | null, TxCandidate, RedeemTxInfo, Error | null]>;

  deposit(params: DepositParams): Promise<[Transaction | null, TxCandidate, DepositTxInfo, Error | null]>;

  poolCreation(params: PoolCreationParams): Promise<[Transaction | null, TxCandidate, PoolCreationTxInfo, Error | null]>;
}

const MAX_TRANSACTION_BUILDING_TRY_COUNT = 3

export class DefaultAmmTxCandidateBuilder implements AmmTxBuilder {
  private swapAmmTxBuilder: SwapAmmTxBuilder

  private redeemAmmTxBuilder: RedeemAmmTxBuilder

  private depositAmmTxBuilder: DepositAmmTxBuilder

  private poolTxBuilder: PoolCreationTxBuilder

  private lockTxBuilder: LockTxBuilder

  private unlockTxBuilder: UnlockTxBuilder

  constructor(
    txMath: TxMath,
    ammOuptuts: AmmOutputs,
    ammActions: AmmActions,
    inputSelector: InputSelector,
    private inputCollector: InputCollector,
    collateralSelector: CollateralSelector,
    R: CardanoWasm,
    private txAsm: TxAsm,
    addrs: OrderAddrs,
    scripts: ScriptCreds,
    pparams: ProtocolParams,
    network: CardanoNetwork,
  ) {
    this.swapAmmTxBuilder = new SwapAmmTxBuilder(txMath, ammOuptuts, ammActions, inputSelector, R)
    this.redeemAmmTxBuilder = new RedeemAmmTxBuilder(txMath, ammOuptuts, ammActions, inputSelector, R)
    this.depositAmmTxBuilder = new DepositAmmTxBuilder(txMath, ammOuptuts, ammActions, inputSelector, R)
    this.poolTxBuilder = new PoolCreationTxBuilder(txMath, ammOuptuts, ammActions, inputSelector, collateralSelector)
    this.lockTxBuilder = new LockTxBuilder(txMath, ammOuptuts, ammActions, inputSelector, R);
    this.unlockTxBuilder = new UnlockTxBuilder(collateralSelector, inputSelector, pparams, network, addrs, scripts, txMath, R);
  }

  async swap(
    swapParams: SwapParams,
    currentTry = 1,
    bestTransaction?: Transaction | null,
    prevTxFee?: bigint,
    allInputs?: FullTxIn[],
  ): Promise<[Transaction | null, TxCandidate, SwapTxInfo, Error | null]> {
    console.log(swapParams);
    if (currentTry >= MAX_TRANSACTION_BUILDING_TRY_COUNT && bestTransaction && allInputs) {
      const [swapTxCandidate, swapTxInfo] = await this
        .swapAmmTxBuilder
        .build(swapParams, allInputs, BigInt(bestTransaction.body().fee().to_str()))
      return [bestTransaction, swapTxCandidate, swapTxInfo, null]
    }
    const newAllInputs = await (allInputs ? Promise.resolve(allInputs) : this.inputCollector.getInputs());
    const [swapTxCandidate, swapTxInfo, error] = await this.swapAmmTxBuilder.build(swapParams, newAllInputs, prevTxFee)

    if (error) {
      console.log(error)
      return [null, swapTxCandidate, {...swapTxInfo, txFee: undefined}, error]
    }

    try {
      const transaction = this.txAsm.finalize(swapTxCandidate)
      const txFee = BigInt(transaction.body().fee().to_str())

      if (prevTxFee === txFee) {
        return [transaction, swapTxCandidate, swapTxInfo, null]
      } else {
        const newBestTxData: Transaction | null | undefined = !!prevTxFee && txFee < prevTxFee ?
          transaction :
          bestTransaction

        return this.swap(swapParams, currentTry + 1, newBestTxData, txFee, newAllInputs)
      }
    } catch (e) {
      console.log(e)
      return [null, swapTxCandidate, {...swapTxInfo, txFee: undefined}, e]
    }
  }

  async redeem(
    redeemParams: RedeemParams,
    currentTry = 1,
    bestTransaction?: Transaction | null,
    prevTxFee?: bigint,
    allInputs?: FullTxIn[],
  ): Promise<[Transaction | null, TxCandidate, RedeemTxInfo, Error | null]> {
    if (currentTry >= MAX_TRANSACTION_BUILDING_TRY_COUNT && bestTransaction && allInputs) {
      const [redeemTxCandidate, redeemTxInfo] = await this
        .redeemAmmTxBuilder
        .build(redeemParams, allInputs, BigInt(bestTransaction.body().fee().to_str()))
      return [bestTransaction, redeemTxCandidate, redeemTxInfo, null]
    }

    const newAllInputs = await (allInputs ? Promise.resolve(allInputs) : this.inputCollector.getInputs());
    const [redeemTxCandidate, redeemTxInfo] = await this.redeemAmmTxBuilder.build(redeemParams, newAllInputs, prevTxFee)

    try {
      const transaction = this.txAsm.finalize(redeemTxCandidate)
      const txFee = BigInt(transaction.body().fee().to_str())

      if (prevTxFee === txFee) {
        return [transaction, redeemTxCandidate, redeemTxInfo, null]
      } else {
        const newBestTxData: Transaction | null | undefined = !!prevTxFee && txFee < prevTxFee ?
          transaction :
          bestTransaction

        return this.redeem(redeemParams, currentTry + 1, newBestTxData, txFee, newAllInputs)
      }
    } catch (e) {
      console.log(e)
      return [null, redeemTxCandidate, {...redeemTxInfo, txFee: undefined}, e]
    }
  }

  async deposit(
    depositParams: DepositParams,
    currentTry = 0,
    bestTransaction?: Transaction | null,
    prevTxFee?: bigint,
    allInputs?: FullTxIn[],
  ): Promise<[Transaction | null, TxCandidate, DepositTxInfo, Error | null]> {
    if (currentTry >= MAX_TRANSACTION_BUILDING_TRY_COUNT && bestTransaction && allInputs) {
      const [depositTxCandidate, depositTxInfo] = await this
        .depositAmmTxBuilder
        .build(depositParams, allInputs, BigInt(bestTransaction.body().fee().to_str()))
      return [bestTransaction, depositTxCandidate, depositTxInfo, null]
    }

    const newAllInputs = await (allInputs ? Promise.resolve(allInputs) : this.inputCollector.getInputs());
    const [depositTxCandidate, depositTxInfo] = await this.depositAmmTxBuilder.build(depositParams, newAllInputs, prevTxFee)

    try {
      const transaction = this.txAsm.finalize(depositTxCandidate)
      const txFee = BigInt(transaction.body().fee().to_str())

      if (prevTxFee === txFee) {
        return [transaction, depositTxCandidate, depositTxInfo, null]
      } else {
        const newBestTxData: Transaction | null | undefined = !!prevTxFee && txFee < prevTxFee ?
          transaction :
          bestTransaction

        return this.deposit(depositParams, currentTry + 1, newBestTxData, txFee, newAllInputs)
      }
    } catch (e) {
      console.log(e)
      return [null, depositTxCandidate, {...depositTxInfo, txFee: undefined}, e]
    }
  }

  async poolCreation(
    poolParams: PoolCreationParams,
    currentTry = 0,
    bestTransaction?: Transaction | null,
    prevTxFee?: bigint,
    allInputs?: FullTxIn[],
  ): Promise<[Transaction | null, TxCandidate, PoolCreationTxInfo, Error | null]> {
    if (currentTry >= MAX_TRANSACTION_BUILDING_TRY_COUNT && bestTransaction && allInputs) {
      const [setupTxCandidate, setupTxInfo] = await this
        .poolTxBuilder
        .build(poolParams, allInputs, BigInt(bestTransaction.body().fee().to_str()))
      return [bestTransaction, setupTxCandidate, setupTxInfo, null]
    }

    const newAllInputs = await (allInputs ? Promise.resolve(allInputs) : this.inputCollector.getInputs());
    const [poolCreationTxCandidate, poolCreationTxInfo] = await this.poolTxBuilder.build(poolParams, newAllInputs, prevTxFee)

    try {
      const transaction = this.txAsm.finalize(poolCreationTxCandidate)
      const txFee = BigInt(transaction.body().fee().to_str())

      if (prevTxFee === txFee) {
        return [
          this.txAsm.finalize(poolCreationTxCandidate, 1.05),
          poolCreationTxCandidate,
          poolCreationTxInfo,
          null
        ]
      } else {
        const newBestTxData: Transaction | null | undefined = !!prevTxFee && txFee < prevTxFee ?
          transaction :
          bestTransaction

        return this.poolCreation(poolParams, currentTry + 1, newBestTxData, txFee, newAllInputs)
      }
    } catch (e) {
      console.log(e)
      return [null, poolCreationTxCandidate, {...poolCreationTxInfo, txFee: undefined}, e]
    }
  }

  async lock(
    lockParams: LockParams,
    currentTry = 0,
    bestTransaction?: Transaction | null,
    prevTxFee?: bigint,
    allInputs?: FullTxIn[],
  ): Promise<[Transaction | null, TxCandidate, LockTxInfo, Error | null]> {
    if (currentTry >= MAX_TRANSACTION_BUILDING_TRY_COUNT && bestTransaction && allInputs) {
      const [setupTxCandidate, setupTxInfo] = await this
        .lockTxBuilder
        .build(lockParams, allInputs, BigInt(bestTransaction.body().fee().to_str()))
      return [bestTransaction, setupTxCandidate, setupTxInfo, null]
    }

    const newAllInputs = await (allInputs ? Promise.resolve(allInputs) : this.inputCollector.getInputs());
    const [lockTxCandidate, lockTxInfo] = await this.lockTxBuilder.build(lockParams, newAllInputs, prevTxFee)

    try {
      const transaction = this.txAsm.finalize(lockTxCandidate)
      const txFee = BigInt(transaction.body().fee().to_str())

      if (prevTxFee === txFee) {
        return [
          this.txAsm.finalize(lockTxCandidate, 1.05),
          lockTxCandidate,
          lockTxInfo,
          null
        ]
      } else {
        const newBestTxData: Transaction | null | undefined = !!prevTxFee && txFee < prevTxFee ?
          transaction :
          bestTransaction

        return this.lock(lockParams, currentTry + 1, newBestTxData, txFee, newAllInputs)
      }
    } catch (e) {
      console.log(e)
      return [null, lockTxCandidate, {...lockTxInfo, txFee: undefined}, e]
    }
  }

  async unlock(
    unlockParams: UnlockParams,
    currentTry = 0,
    bestTransaction?: Transaction | null,
    prevTxFee?: bigint,
    allInputs?: FullTxIn[],
  ): Promise<[Transaction | null, TxCandidate, UnlockTxInfo, Error | null]> {
    if (currentTry >= MAX_TRANSACTION_BUILDING_TRY_COUNT && bestTransaction && allInputs) {
      const [unlockTxCandidate, unlockTxInfo] = await this
        .unlockTxBuilder
        .build(unlockParams, allInputs, BigInt(bestTransaction.body().fee().to_str()))
      return [bestTransaction, unlockTxCandidate, unlockTxInfo, null]
    }

    const newAllInputs = await (allInputs ? Promise.resolve(allInputs) : this.inputCollector.getInputs());
    const [unlockTxCandidate, unlockTxInfo, error] = await this.unlockTxBuilder.build(unlockParams, newAllInputs, prevTxFee)

    if (error) {
      console.log(error)
      return [null, unlockTxCandidate, {...unlockTxInfo, txFee: undefined}, error]
    }

    try {
      const transaction = this.txAsm.finalize(unlockTxCandidate)
      const txFee = BigInt(transaction.body().fee().to_str())

      if (prevTxFee === txFee) {
        return [
          this.txAsm.finalize(unlockTxCandidate, 1.5),
          unlockTxCandidate,
          unlockTxInfo,
          null
        ]
      } else {
        const newBestTxData: Transaction | null | undefined = !!prevTxFee && txFee < prevTxFee ?
          transaction :
          bestTransaction

        return this.unlock(unlockParams, currentTry + 1, newBestTxData, txFee, newAllInputs)
      }
    } catch (e) {
      console.log(e)
      return [null, unlockTxCandidate, {...unlockTxInfo, txFee: undefined}, e]
    }
  }
}
