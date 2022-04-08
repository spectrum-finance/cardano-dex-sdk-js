import {PlutusData} from "@emurgo/cardano-serialization-lib-browser"
import {PlutusList} from "@emurgo/cardano-serialization-lib-nodejs"
import {AssetClass} from "../cardano/entities/assetClass"
import {Datum, HexString} from "../cardano/types"
import {decodeHex, encodeHex} from "../utils/hex"
import {CardanoWasm} from "../utils/rustLoader"
import {DepositRequest, RedeemRequest, SwapRequest} from "./models/opRequests"
import {PoolDatum} from "./models/poolDatum"

export function parsePoolDatum(raw: Datum, R: CardanoWasm): PoolDatum | undefined {
  const datum = R.PlutusData.from_bytes(decodeHex(raw)).as_constr_plutus_data()!.data()
  const nft = parseAssetClass(datum.get(0))
  const x = parseAssetClass(datum.get(1))
  const y = parseAssetClass(datum.get(2))
  const lq = parseAssetClass(datum.get(3))
  const feeNum = datum.get(4).as_integer()
  return nft && x && y && lq && feeNum ? {nft, x, y, lq, feeNum: Number(feeNum.to_str())} : undefined
}

export function mkSwapDatum(conf: SwapRequest, R: CardanoWasm): PlutusData {
  const base = mkAssetClass(conf.baseInput.asset, R)
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
  const x = mkAssetClass(conf.x.asset, R)
  const y = mkAssetClass(conf.y.asset, R)
  const lq = mkAssetClass(conf.lq, R)
  const exFee = R.PlutusData.new_integer(R.BigInt.from_str(conf.exFee.toString()))
  const rewardPkh = R.PlutusData.new_bytes(decodeHex(conf.rewardPkh))
  const collateralAda = R.PlutusData.new_integer(R.BigInt.from_str(conf.collateralAda.toString()))
  return mkProductN([poolNft, x, y, lq, exFee, rewardPkh, collateralAda], R)
}

export function mkRedeemDatum(conf: RedeemRequest, R: CardanoWasm): PlutusData {
  const poolNft = mkAssetClass(conf.poolId, R)
  const x = mkAssetClass(conf.x, R)
  const y = mkAssetClass(conf.y, R)
  const lq = mkAssetClass(conf.lq.asset, R)
  const exFee = R.PlutusData.new_integer(R.BigInt.from_str(conf.exFee.toString()))
  const rewardPkh = R.PlutusData.new_bytes(decodeHex(conf.rewardPkh))
  return mkProductN([poolNft, x, y, lq, exFee, rewardPkh], R)
}

function mkProductN(members: PlutusData[], R: CardanoWasm): PlutusData {
  const bf = R.PlutusList.new()
  for (const m of members) bf.add(m)
  return mkPlutusData(bf, R)
}

function mkByteStringFromHex(hex: HexString, R: CardanoWasm): PlutusData {
  return R.PlutusData.new_bytes(decodeHex(hex))
}

function mkPlutusData(members: PlutusList, R: CardanoWasm): PlutusData {
  return R.PlutusData.new_constr_plutus_data(R.ConstrPlutusData.new(R.BigNum.zero(), members))
}

export function mkAssetClass(ac: AssetClass, R: CardanoWasm): PlutusData {
  const assetClass = R.PlutusList.new()
  assetClass.add(mkByteStringFromHex(ac.policyId, R))
  assetClass.add(R.PlutusData.new_bytes(new TextEncoder().encode(ac.name)))
  return mkPlutusData(assetClass, R)
}

export function parseAssetClass(pd: PlutusData): AssetClass | undefined {
  const ac = pd.as_constr_plutus_data()!.data()
  const policyId = encodeHex(ac.get(0).as_bytes()!)
  const nameHex = encodeHex(ac.get(1).as_bytes()!);
  const name = new TextDecoder().decode(ac.get(1).as_bytes()!)
  const subject = `${policyId}${nameHex}`;

  return {policyId, name, subject}
}
