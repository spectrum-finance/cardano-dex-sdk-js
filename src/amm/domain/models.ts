import {decimalToFractional} from "../../utils/math.ts"

export type FeePerToken = {
  numerator: bigint
  denominator: bigint
}

export function feePerTokenFromDecimal(feePerToken: number): FeePerToken {
  const [numerator, denominator] = decimalToFractional(feePerToken)
  return {numerator, denominator}
}
