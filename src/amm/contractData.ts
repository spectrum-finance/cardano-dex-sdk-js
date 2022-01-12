import {PlutusData} from "@emurgo/cardano-serialization-lib-browser"
import {PlutusList} from "@emurgo/cardano-serialization-lib-nodejs"
import {AssetClass} from "../cardano/entities/assetClass"
import {HexString} from "../cardano/types"
import {decodeHex} from "../utils/hex"
import {CardanoWasm} from "../utils/rustLoader"
import {DepositRequest, RedeemRequest, SwapRequest} from "./models/opRequests"

export function mkSwapDatum(conf: SwapRequest, R: CardanoWasm): PlutusData {
  const base = mkAssetClass(conf.baseInput.id, R)
  const quote = mkAssetClass(conf.quoteAsset, R)
  const poolNft = mkAssetClass(conf.poolId, R)
  const feeNum = R.PlutusData.new_integer(R.BigInt.from_str(conf.poolFeeNum.toString()))
  const feePerTokenNum = R.PlutusData.new_integer(R.BigInt.from_str(conf.exFeePerToken.numerator.toString()))
  const feePerTokenDen = R.PlutusData.new_integer(
    R.BigInt.from_str(conf.exFeePerToken.denominator.toString())
  )
  const rewardPkh = R.PlutusData.new_bytes(decodeHex(conf.rewardPkh))
  const baseAmount = R.PlutusData.new_integer(R.BigInt.from_str(conf.baseInput.amount.toString()))
  const minQuoteAmount = R.PlutusData.new_integer(R.BigInt.from_str(conf.minQuoteOutput.toString()))
  return mkProductN(
    [base, quote, poolNft, feeNum, feePerTokenNum, feePerTokenDen, rewardPkh, baseAmount, minQuoteAmount],
    R
  )
}

export function mkDepositDatum(conf: DepositRequest, R: CardanoWasm): PlutusData {
  const poolNft = mkAssetClass(conf.poolId, R)
  const exFee = R.PlutusData.new_integer(R.BigInt.from_str(conf.exFee.toString()))
  const rewardPkh = R.PlutusData.new_bytes(decodeHex(conf.rewardPkh))
  const collateralAda = R.PlutusData.new_integer(R.BigInt.from_str(conf.collateralAda.toString()))
  return mkProductN([poolNft, exFee, rewardPkh, collateralAda], R)
}

export function mkRedeemDatum(conf: RedeemRequest, R: CardanoWasm): PlutusData {
  const poolNft = mkAssetClass(conf.poolId, R)
  const exFee = R.PlutusData.new_integer(R.BigInt.from_str(conf.exFee.toString()))
  const rewardPkh = R.PlutusData.new_bytes(decodeHex(conf.rewardPkh))
  return mkProductN([poolNft, exFee, rewardPkh], R)
}

function mkProductN(members: PlutusData[], R: CardanoWasm): PlutusData {
  const bf = R.PlutusList.new()
  for (const m of members) bf.add(m)
  return mkPlutusData(bf, R)
}

function mkByteString(hex: HexString, R: CardanoWasm): PlutusData {
  return R.PlutusData.from_bytes(decodeHex(hex))
}

function mkPlutusData(members: PlutusList, R: CardanoWasm): PlutusData {
  return R.PlutusData.new_constr_plutus_data(R.ConstrPlutusData.new(R.BigNum.zero(), members))
}

function mkAssetClass(ac: AssetClass, R: CardanoWasm): PlutusData {
  const assetClass = R.PlutusList.new()
  assetClass.add(mkByteString(ac.policyId, R))
  assetClass.add(mkByteString(ac.name, R)) // todo:
  return mkPlutusData(assetClass, R)
}
