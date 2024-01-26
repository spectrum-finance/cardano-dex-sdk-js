import {Addr} from "../../../cardano/entities/address"
import {AdaEntry} from "../../../cardano/entities/assetEntry"
import {PubKeyHash} from "../../../cardano/entities/publicKey"
import {TxCandidate} from "../../../cardano/entities/tx"
import {FullTxIn} from "../../../cardano/entities/txIn"
import {add, Value} from "../../../cardano/entities/value"
import {InputSelector} from "../../../cardano/wallet/inputSelector"
import {TxMath} from "../../../cardano/wallet/txMath"
import {AssetAmount} from "../../../domain/assetAmount"
import {AmmTxFeeMapping} from "../../math/order"
import {OrderKind} from "../../models/opRequests"
import {AmmActions} from "../ammActions"
import {AmmOutputs} from "../ammOutputs"
import {selectInputs} from "./selectInputs"
import {CardanoWasm} from "../../../utils/rustLoader"


export interface LockParams {
  readonly lockedUntil: number;
  readonly changeAddress: Addr;
  readonly pk: PubKeyHash;
  readonly txFees: AmmTxFeeMapping;
  readonly lq: AssetAmount;
}

export interface LockTxInfo {
  readonly txFee: bigint | undefined;
  readonly orderBudget: Value
  readonly orderValue: Value
  readonly refundableDeposit: bigint;
}


export class LockTxBuilder {
  constructor(
    private txMath: TxMath,
    private ammOutputs: AmmOutputs,
    private ammActions: AmmActions,
    private inputSelector: InputSelector,
    private R: CardanoWasm
  ) {
  }

  async build(params: LockParams, allInputs: FullTxIn[], userTxFee?: bigint): Promise<[TxCandidate, LockTxInfo, Error | undefined]> {
    const [orderValue, refundableBugdetPart] = this.getLockOrderBudget(params)
    const totalOrderBudget = add(orderValue, AdaEntry(userTxFee || params.txFees.lockOrder))

    const inputsOrError = await selectInputs(totalOrderBudget, params.changeAddress, this.inputSelector, allInputs, this.txMath)
    const inputs: FullTxIn[] = inputsOrError instanceof Error ? [] : inputsOrError

    const txInfo: LockTxInfo = {
      orderValue:        orderValue,
      orderBudget:       totalOrderBudget,
      refundableDeposit: refundableBugdetPart,
      txFee:             userTxFee || params.txFees.redeemOrder
    }

    return [
      this.ammActions.createOrder(
        {
          kind:        OrderKind.Lock,
          lockedUntil: params.lockedUntil,
          redeemer:    params.pk,
          stake: this.R.BaseAddress.from_address(this.R.Address.from_bech32(params.changeAddress))?.stake_cred(),
          orderValue:  orderValue,
          uiFee:       0n
        },
        {
          changeAddr:       params.changeAddress,
          collateralInputs: [],
          inputs:           inputs
        }
      ),
      txInfo,
      inputsOrError instanceof Error ? inputsOrError : undefined
    ]

  }

  private getLockOrderBudget(
    params: LockParams
  ): [Value, bigint] {
    const orderValue = Value(0n, [params.lq])

    const [estimatedOutput] = this.ammOutputs.lockLiquidity({
      kind:        OrderKind.Lock,
      lockedUntil: params.lockedUntil,
      redeemer:    params.pk,
      stake:       this.R.BaseAddress.from_address(this.R.Address.from_bech32(params.changeAddress))?.stake_cred(),
      orderValue,
      uiFee:       0n
    })
    const requiredAdaForOutput = this.txMath.minAdaRequiredforOutput(estimatedOutput)

    return [
      add(orderValue, AdaEntry(requiredAdaForOutput)),
      requiredAdaForOutput
    ]
  }
}
