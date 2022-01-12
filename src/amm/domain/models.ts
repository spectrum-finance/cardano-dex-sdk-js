import {AssetClass} from "../../cardano/entities/assetClass"
import {PubKeyHash} from "../../cardano/entities/publicKey"

export type FeePerToken = {
  numerator: bigint
  denominator: bigint
}

export type SwapConfig = {
  base: AssetClass
  quote: AssetClass
  poolNft: AssetClass
  feeNum: bigint
  feePerToken: FeePerToken
  rewardPkh: PubKeyHash
  baseAmount: bigint
  minQuoteAmount: bigint
}
