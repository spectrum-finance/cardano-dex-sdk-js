import {all, BigNumber, ConfigOptions, create, FormatOptions, MathJsStatic} from "mathjs"

const mathConf: ConfigOptions = {
  epsilon: 1e-24,
  matrix: "Matrix",
  number: "BigNumber",
  precision: 64
}

const formatOptions: FormatOptions = {
  notation: "fixed"
}

export const math = create(all, mathConf) as Partial<MathJsStatic>

export function evaluate(expr: string): string {
  return math.format!(math.evaluate!(expr), formatOptions)
}

export function decimalToFractional(n: BigNumber | number): [bigint, bigint] {
  const fmtN = math.format!(n, formatOptions)
  const [whole, decimals = ""] = String(fmtN).split(".")
  const numDecimals = decimals.length
  const denominator = BigInt(evaluate(`10^${numDecimals}`))
  const numerator = BigInt(whole) * denominator + BigInt(decimals)
  return [numerator, denominator]
}

export function sqrt(x: bigint): bigint {
  function go(n: bigint, x0: bigint): bigint {
    const x1 = (n / x0 + x0) >> 1n
    if (x0 === x1 || x0 === x1 - 1n) {
      return x0
    }
    return go(n, x1)
  }

  if (x < 0n) throw "Square root of negative number is not supported"
  else if (x < 2n) return x
  else return go(x, 1n)
}
