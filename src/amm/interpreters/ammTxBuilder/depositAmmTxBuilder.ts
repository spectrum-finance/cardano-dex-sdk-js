import {Addr} from "../../../cardano/entities/address"
import {AdaEntry} from "../../../cardano/entities/assetEntry"
import {PubKeyHash} from "../../../cardano/entities/publicKey"
import {stakeKeyHashFromAddr} from "../../../cardano/entities/stakeKey"
import {TxCandidate} from "../../../cardano/entities/tx"
import {FullTxIn} from "../../../cardano/entities/txIn"
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
import {selectInputs} from "./selectInputs"

export interface DepositParams {
  readonly x: AssetAmount;
  readonly y: AssetAmount;
  readonly pool: AmmPool;
  readonly slippage: number;
  readonly txFees: AmmTxFeeMapping;
  readonly minExecutorReward: Lovelace;
  readonly changeAddress: Addr;
  readonly pk: PubKeyHash;
}

export interface DepositTxInfo {
  readonly txFee: bigint | undefined;
  readonly exFee: bigint;
  readonly refundableDeposit: bigint;
  readonly x: AssetAmount;
  readonly y: AssetAmount;
  readonly lq: AssetAmount;
  readonly orderBudget: Value;
  readonly orderValue: Value;
}

export class DepositAmmTxBuilder {
  constructor(
    private txMath: TxMath,
    private ammOutputs: AmmOutputs,
    private ammActions: AmmActions,
    private inputSelector: InputSelector,
    private R: CardanoWasm
  ) {}

  async build(params: DepositParams, userTxFee?: bigint): Promise<[TxCandidate, DepositTxInfo]> {
    const {txFees, minExecutorReward, x, y, changeAddress, pool} = params
    const lp = pool.rewardLP(x, y);
    const exFee = minExecutorReward + txFees.depositOrder;

    const [rawOrderValue, refundableValuePart] = this.getDepositOrderValue(
      x,
      y,
      lp,
      exFee,
      changeAddress
    );
    const [orderValue, refundableBugdetPart] = this.getDepositOrderBudget(
      rawOrderValue,
      lp,
      refundableValuePart,
      exFee,
      params,
    )
    const totalOrderBudget = add(orderValue, AdaEntry(userTxFee || txFees.depositOrder))

    const inputsOrError = await selectInputs(totalOrderBudget, changeAddress, this.inputSelector, this.txMath);
    const inputs: FullTxIn[] = inputsOrError instanceof Error ? [] : inputsOrError;

    const txInfo: DepositTxInfo = {
      exFee: exFee,
      x,
      y,
      lq: lp,
      orderValue: orderValue,
      orderBudget: totalOrderBudget,
      refundableDeposit: refundableValuePart + refundableBugdetPart,
      txFee: userTxFee || txFees.redeemOrder
    }

    return [
      this.ammActions.createOrder(
        {
          kind:          OrderKind.Deposit,
          poolId:        params.pool.id,
          x:             params.x,
          y:             params.y,
          lq:            lp.asset,
          rewardPkh:     params.pk,
          stakePkh:      stakeKeyHashFromAddr(params.changeAddress, this.R),
          exFee:         exFee,
          uiFee:         0n,
          orderValue:    orderValue,
          collateralAda: refundableValuePart + refundableBugdetPart,
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

  private getDepositOrderBudget(
    orderValue: Value,
    lq: AssetAmount,
    depositCollateral: bigint,
    exFee: bigint,
    params: DepositParams,
  ): [Value, bigint] {
    const estimatedOutput = this.ammOutputs.deposit({
      kind: OrderKind.Deposit,
      poolId: params.pool.id,
      x: params.x,
      y: params.y,
      lq: lq.asset,
      rewardPkh: params.pk,
      stakePkh: stakeKeyHashFromAddr(params.changeAddress, this.R),
      exFee: exFee,
      uiFee: 0n,
      orderValue: orderValue,
      collateralAda: depositCollateral,
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

  private getDepositOrderValue(
    inputX: AssetAmount,
    inputY: AssetAmount,
    output: AssetAmount,
    exFee: Lovelace,
    addr: Addr
  ): [Value, bigint] {
    const estimatedExecutorOutTxCandidate: TxOutCandidate = {
      value: Value(0n, [output, inputX, inputY]),
      addr
    }
    console.log(estimatedExecutorOutTxCandidate);
    const requiredAdaForOutput = 0n;
    return [add(add(add(Value(requiredAdaForOutput), inputX.toEntry), inputY.toEntry), AdaEntry(exFee)), requiredAdaForOutput];
  }
}
