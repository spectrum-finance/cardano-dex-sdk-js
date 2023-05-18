import {Addr} from "../../../cardano/entities/address"
import {AdaEntry} from "../../../cardano/entities/assetEntry"
import {PubKeyHash} from "../../../cardano/entities/publicKey"
import {stakeKeyHashFromAddr} from "../../../cardano/entities/stakeKey"
import {TxCandidate} from "../../../cardano/entities/tx"
import {TxOutCandidate} from "../../../cardano/entities/txOut"
import {add, getLovelace, Value} from "../../../cardano/entities/value"
import {Lovelace} from "../../../cardano/types"
import {InputSelector} from "../../../cardano/wallet/inputSelector"
import {TxMath} from "../../../cardano/wallet/txMath"
import {AssetAmount} from "../../../domain/assetAmount"
import {CardanoWasm} from "../../../utils/rustLoader"
import {AmmPool} from "../../domain/ammPool"
import {AmmTxFeeMapping} from "../../math/order"
import {OrderKind} from "../../models/opRequests"
import {AmmActions} from "../ammActions"
import {AmmOutputs} from "../ammOutputs"

export interface RedeemParams {
  readonly lq: AssetAmount;
  readonly pool: AmmPool;
  readonly slippage: number;
  readonly txFees: AmmTxFeeMapping;
  readonly minExecutorReward: Lovelace;
  readonly changeAddress: Addr;
  readonly pk: PubKeyHash;
}

export interface RedeemTxInfo {
  readonly txFee: bigint | undefined;
  readonly exFee: bigint;
  readonly refundableDeposit: bigint;
  xOutput: AssetAmount;
  yOutput: AssetAmount;
  readonly orderBudget: Value;
  readonly orderValue: Value;
}

export class RedeemAmmTxBuilder {
  constructor(
    private txMath: TxMath,
    private ammOutputs: AmmOutputs,
    private ammActions: AmmActions,
    private inputSelector: InputSelector,
    private R: CardanoWasm
  ) {}

  async build(params: RedeemParams, userTxFee?: bigint): Promise<[TxCandidate, RedeemTxInfo]> {
    const {txFees, minExecutorReward, lq, changeAddress, pool} = params
    const [x, y] = pool.shares(lq);
    const exFee = minExecutorReward + txFees.redeemExecution;

    const [rawOrderValue, refundableValuePart] = this.getRedeemOrderValue(
      lq,
      exFee,
      x,
      y,
      changeAddress
    );
    const [orderValue, refundableBugdetPart] = this.getRedeemOrderBudget(
      rawOrderValue,
      exFee,
      params,
    )
    const totalOrderBudget = add(orderValue, AdaEntry(userTxFee || txFees.redeemOrder))
    const txInfo: RedeemTxInfo = {
      exFee: exFee,
      xOutput: x,
      yOutput: y,
      orderValue: orderValue,
      orderBudget: totalOrderBudget,
      refundableDeposit: refundableValuePart + refundableBugdetPart,
      txFee: userTxFee || txFees.redeemOrder
    }

    const inputs = await this.inputSelector.select(totalOrderBudget)

    if (inputs instanceof Error) {
      throw new Error("insufficient funds")
    }

    return [
      this.ammActions.createOrder(
        {
          kind: OrderKind.Redeem,
          poolId: params.pool.id,
          x: params.pool.x.asset,
          y: params.pool.y.asset,
          lq: params.lq,
          rewardPkh: params.pk,
          stakePkh: stakeKeyHashFromAddr(params.changeAddress, this.R),
          exFee: exFee,
          uiFee: 0n,
          orderValue: orderValue,
        },
        {
          changeAddr: params.changeAddress,
          collateralInputs: [],
          inputs: inputs
        }
      ),
      txInfo
    ]
  }

  private getRedeemOrderBudget(
    orderValue: Value,
    exFee: bigint,
    params: RedeemParams,
  ): [Value, bigint] {
    const estimatedOutput = this.ammOutputs.redeem({
      kind: OrderKind.Redeem,
      poolId: params.pool.id,
      x: params.pool.x.asset,
      y: params.pool.y.asset,
      lq: params.lq,
      rewardPkh: params.pk,
      stakePkh: stakeKeyHashFromAddr(params.changeAddress, this.R),
      exFee: exFee,
      uiFee: 0n,
      orderValue: orderValue,
    })
    const requiredAdaForOutput = this.txMath.minAdaRequiredforOutput(estimatedOutput)
    const lovelace = getLovelace(orderValue)

    return lovelace.amount >= requiredAdaForOutput
      ? [orderValue, 0n]
      : [
          add(orderValue, AdaEntry(requiredAdaForOutput - lovelace.amount)),
          requiredAdaForOutput - lovelace.amount
        ]
  }

  private getRedeemOrderValue(
    input: AssetAmount,
    exFee: Lovelace,
    x: AssetAmount,
    y: AssetAmount,
    addr: Addr
  ): [Value, bigint] {
    const output = add(Value(0n, x), y.toEntry);
    const estimatedExecutorOutTxCandidate: TxOutCandidate = {
      value: output,
      addr
    }
    const requiredAdaForOutput = this.txMath.minAdaRequiredforOutput(estimatedExecutorOutTxCandidate)

    if (!x.isAda && !y.isAda) {
      return [add(add(Value(requiredAdaForOutput), input.toEntry), AdaEntry(exFee)), requiredAdaForOutput]
    }
    if (x.isAda && x.amount >= requiredAdaForOutput || y.isAda && y.amount >= requiredAdaForOutput) {
      return [add(Value(exFee), input.toEntry), 0n]
    }
    if (x.isAda) {
      return [
        add(add(Value(requiredAdaForOutput - x.amount), input.toEntry), AdaEntry(exFee)),
        requiredAdaForOutput - x.amount
      ]
    }
    return [
      add(add(Value(requiredAdaForOutput - y.amount), input.toEntry), AdaEntry(exFee)),
      requiredAdaForOutput - y.amount
    ]
  }
}
