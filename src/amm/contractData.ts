import {PlutusData} from "@emurgo/cardano-serialization-lib-browser"
import {PlutusList} from "@emurgo/cardano-serialization-lib-nodejs"
import {AssetClass} from "../cardano/entities/assetClass"
import {HexString} from "../cardano/types"
import {decodeHex} from "../utils/hex"
import {CardanoWasm} from "../utils/rustLoader"
import {SwapConfig} from "./domain/models"

export function mkByteString(hex: HexString, R: CardanoWasm): PlutusData {
  return R.PlutusData.from_bytes(decodeHex(hex))
}

export function mkPlutusData(members: PlutusList, R: CardanoWasm): PlutusData {
  return R.PlutusData.new_constr_plutus_data(R.ConstrPlutusData.new(R.BigNum.zero(), members))
}

export function mkAssetClass(ac: AssetClass, R: CardanoWasm): PlutusData {
  const assetClass = R.PlutusList.new()
  assetClass.add(mkByteString(ac.policyId, R))
  assetClass.add(mkByteString(ac.name, R)) // todo:
  return mkPlutusData(assetClass, R)
}

export function mkSwapDatum(
  conf: SwapConfig,
  R: CardanoWasm
): PlutusData {
  const swap = R.PlutusList.new()
  const base = mkAssetClass(conf.base, R)
  swap.add(base)
  const quote = mkAssetClass(conf.quote, R)
  swap.add(quote)
  const poolNft = mkAssetClass(conf.poolNft, R)
  swap.add(poolNft)
  const feeNum = R.PlutusData.new_integer(R.BigInt.from_str(conf.feeNum.toString()))
  swap.add(feeNum)
  const feePerTokenNum = R.PlutusData.new_integer(R.BigInt.from_str(conf.feePerToken.numerator.toString()))
  swap.add(feePerTokenNum)
  const feePerTokenDen = R.PlutusData.new_integer(R.BigInt.from_str(conf.feePerToken.denominator.toString()))
  swap.add(feePerTokenDen)
  const rewardPkh = R.PlutusData.new_bytes(decodeHex(conf.rewardPkh))
  swap.add(rewardPkh)
  const baseAmount = R.PlutusData.new_integer(R.BigInt.from_str(conf.baseAmount.toString()))
  swap.add(baseAmount)
  const minQuoteAmount = R.PlutusData.new_integer(R.BigInt.from_str(conf.minQuoteAmount.toString()))
  swap.add(minQuoteAmount)
  return mkPlutusData(swap, R)
}
