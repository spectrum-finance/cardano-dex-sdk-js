import {Value} from "../../../cardano/entities/value"
import {AssetAmount} from "../../../domain/assetAmount"

export interface TxInfo {
  readonly txFee: bigint | undefined;
  readonly minExFee: bigint
  readonly maxExFee: bigint
  readonly refundableDeposit: bigint
  readonly minOutput: AssetAmount
  readonly maxOutput: AssetAmount
  readonly orderBudget: Value
  readonly orderValue: Value
}
