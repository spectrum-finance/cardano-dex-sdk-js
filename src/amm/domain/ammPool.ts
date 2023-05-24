import {isAssetClassEquals} from "../../cardano/entities/assetClass.ts"
import {AssetAmount} from "../../domain/assetAmount.ts"
import {Price} from "../../domain/price.ts"
import {EmissionLP} from "../constants.ts"
import {PoolId} from "./types.ts"

export class AmmPool {
  constructor(
    public readonly id: PoolId,
    public readonly lp: AssetAmount,
    public readonly x: AssetAmount,
    public readonly y: AssetAmount,
    public readonly poolFeeNum: number
  ) {
    this.feeNum = BigInt(poolFeeNum)
  }

  readonly feeDenom: bigint = 1000n
  readonly feeNum: bigint

  get supplyLP(): bigint {
    return EmissionLP - this.lp.amount
  }

  /** @return Price of tokenX in tokenY units.
   */
  get priceX(): Price {
    return {numerator: this.y.amount, denominator: this.x.amount}
  }

  /** @return Price of tokenY in tokenX units.
   */
  get priceY(): Price {
    return {numerator: this.x.amount, denominator: this.y.amount}
  }

  /** @return proportional amount of one token to a given input of the other
   */
  depositAmount(input: AssetAmount): AssetAmount {
    if (isAssetClassEquals(input.asset, this.x.asset))
      return this.y.withAmount((input.amount * this.priceX.numerator) / this.priceX.denominator)
    else return this.x.withAmount((input.amount * this.priceY.numerator) / this.priceY.denominator)
  }

  /** @return pair of asset amounts proportional to a given input of LP tokens.
   */
  shares(input: AssetAmount): [AssetAmount, AssetAmount] {
    if (isAssetClassEquals(input.asset, this.lp.asset)) {
      return [
        this.x.withAmount((input.amount * this.x.amount) / this.supplyLP),
        this.y.withAmount((input.amount * this.y.amount) / this.supplyLP)
      ]
    } else {
      return [this.x.withAmount(0n), this.y.withAmount(0n)]
    }
  }

  /** @return amount of LP asset proportional to the amounts of assets deposited.
   */
  rewardLP(inputX: AssetAmount, inputY: AssetAmount): AssetAmount {
    if (isAssetClassEquals(inputX.asset, this.x.asset) && isAssetClassEquals(inputY.asset, this.y.asset)) {
      const rewardXWise = (inputX.amount * this.supplyLP) / this.x.amount
      const rewardYWise = (inputY.amount * this.supplyLP) / this.y.amount
      return this.lp.withAmount(rewardXWise <= rewardYWise ? rewardXWise : rewardYWise)
    } else {
      return this.lp.withAmount(0n)
    }
  }

  /** @return Input amount of one token for a given output amount of the other
   */
  inputAmount(output: AssetAmount, maxSlippage?: number): AssetAmount | undefined {
    const slippage = BigInt((maxSlippage || 0) * 100)
    const minimalOutput = this.outputAmount(output).amount
    if (
      isAssetClassEquals(output.asset, this.x.asset) &&
      minimalOutput > 0 &&
      output.amount <= this.x.amount
    ) {
      return this.y.withAmount(
        (this.y.amount * output.amount * this.feeDenom) /
          ((this.x.amount + (this.x.amount * slippage) / (100n * 100n) - output.amount) * this.feeNum) +
          1n
      )
    } else if (
      isAssetClassEquals(output.asset, this.y.asset) &&
      minimalOutput > 0 &&
      output.amount <= this.y.amount
    ) {
      return this.x.withAmount(
        (this.x.amount * output.amount * this.feeDenom) /
          ((this.y.amount + (this.y.amount * slippage) / (100n * 100n) - output.amount) * this.feeNum) +
          1n
      )
    } else {
      return undefined
    }
  }

  /** @param input - swap input
   *  @param maxSlippage - max price slippage allowed % (0 - 100)
   *  @return Output amount of one token for a given input amount of the other
   */
  outputAmount(input: AssetAmount, maxSlippage?: number): AssetAmount {
    const slippage = BigInt((maxSlippage || 0) * 100)
    if (isAssetClassEquals(input.asset, this.x.asset))
      return this.y.withAmount(
        (this.y.amount * input.amount * this.feeNum) /
          ((this.x.amount + (this.x.amount * slippage) / (100n * 100n)) * this.feeDenom +
            input.amount * this.feeNum)
      )
    else
      return this.x.withAmount(
        (this.x.amount * input.amount * this.feeNum) /
          ((this.y.amount + (this.y.amount * slippage) / (100n * 100n)) * this.feeDenom +
            input.amount * this.feeNum)
      )
  }
}
