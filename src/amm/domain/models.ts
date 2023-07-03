import {decimalToFractional} from "../../utils/math"
import {AssetAmount} from "../../domain/assetAmount";
import {HexString} from "../../cardano/types";

export type MintingAsset = {
  amount: AssetAmount,
  script: HexString
}

export type FeePerToken = {
  numerator: bigint
  denominator: bigint
}

export function feePerTokenFromDecimal(feePerToken: number): FeePerToken {
  const [numerator, denominator] = decimalToFractional(feePerToken)
  return {numerator, denominator}
}
