import {HexString} from "../../cardano/types";
import {AssetAmount} from "../../domain/assetAmount";
import {decimalToFractional} from "../../utils/math"
import {ExUnitsDescriptor} from "../interpreters/refundTxBuilder/refundTxBuilder"

export type MintingAsset = {
  amount: AssetAmount,
  script: HexString,
  exUnits: ExUnitsDescriptor
}

export type FeePerToken = {
  numerator: bigint
  denominator: bigint
}

export function feePerTokenFromDecimal(feePerToken: number): FeePerToken {
  const [numerator, denominator] = decimalToFractional(feePerToken)
  return {numerator, denominator}
}
