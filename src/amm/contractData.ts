import {PlutusData} from "@emurgo/cardano-serialization-lib-browser"
import {PlutusList} from "@emurgo/cardano-serialization-lib-nodejs"
import {AssetClass} from "../cardano/entities/assetClass"
import {Datum, HexString} from "../cardano/types"
import {decodeHex, encodeHex} from "../utils/hex"
import {CardanoWasm} from "../utils/rustLoader"
import {
  DepositRequest,
  LockLiquidityRequest,
  PoolCreationRequest,
  RedeemRequest,
  SwapRequest
} from "./models/opRequests"
import {OrderAction} from "./models/orderAction"
import {DepositConfig, RedeemConfig, SwapConfig} from "./models/orderConfig"
import {PoolConfig} from "./models/poolConfig"

export function parsePoolConfig(raw: Datum, R: CardanoWasm): PoolConfig | undefined {
  try {
    const datum = R.PlutusData.from_bytes(decodeHex(raw)).as_constr_plutus_data()!.data()
    const nft = parseAssetClass(datum.get(0))
    const x = parseAssetClass(datum.get(1))
    const y = parseAssetClass(datum.get(2))
    const lq = parseAssetClass(datum.get(3))
    const feeNum = datum.get(4).as_integer()
    const lqBound = datum.get(6).as_integer()
    return nft && x && y && lq && feeNum ?
      {nft, x, y, lq, lqBound: BigInt(lqBound?.to_str() || '0'), feeNum: Number(feeNum.to_str())} :
      undefined
  } catch {
    return undefined;
  }
}

export function parseSwapConfig(raw: Datum, R: CardanoWasm): SwapConfig | undefined {
  const constr = parseConstrData(raw, R)
  if (constr) {
    const base = parseAssetClass(constr.get(0))
    const quote = parseAssetClass(constr.get(1))
    const poolId = parseAssetClass(constr.get(2))
    const feeNum = parseInteger(constr.get(3))
    const feePerTokenNum = parseInteger(constr.get(4))
    const feePerTokenDen = parseInteger(constr.get(5))
    const exFeePerToken =
      feePerTokenNum && feePerTokenDen ? {numerator: feePerTokenNum, denominator: feePerTokenDen} : undefined
    const rewardPkh = paseByteString(constr.get(6))
    const stakePkhPd = parseMaybe(constr.get(7))
    const stakePkh = stakePkhPd ? paseByteString(stakePkhPd) : undefined
    const baseAmount = parseInteger(constr.get(8))
    const minQuoteAmount = parseInteger(constr.get(9))
    return base && quote && poolId && feeNum && exFeePerToken && rewardPkh && baseAmount && minQuoteAmount
      ? {base, quote, poolId, feeNum, exFeePerToken, rewardPkh, stakePkh, baseAmount, minQuoteAmount}
      : undefined
  } else {
    return undefined
  }
}

export function parseOrderRedeemer(raw: Datum, R: CardanoWasm): OrderAction | undefined {
  const constr = parseConstrData(raw, R)
  if (constr) {
    const actionConstr = parseInteger(constr.get(3))
    if (actionConstr) return actionConstr === 0n ? "apply" : "refund"
    else return undefined
  } else {
    return undefined
  }
}

function parseConstrData(raw: Datum, R: CardanoWasm): PlutusList | undefined {
  return R.PlutusData.from_bytes(decodeHex(raw)).as_constr_plutus_data()?.data()
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
  const stakePkh = mkMaybe(conf.stakePkh ? mkByteStringFromHex(conf.stakePkh, R) : undefined, R)
  const baseAmount = R.PlutusData.new_integer(R.BigInt.from_str(conf.baseInput.amount.toString()))
  const minQuoteAmount = R.PlutusData.new_integer(R.BigInt.from_str(conf.minQuoteOutput.toString()))
  return mkProductN(
    [
      base,
      quote,
      poolNft,
      feeNum,
      feePerTokenNum,
      feePerTokenDen,
      rewardPkh,
      stakePkh,
      baseAmount,
      minQuoteAmount
    ],
    R
  )
}

export function mkPoolDatum(conf: PoolCreationRequest, R: CardanoWasm): PlutusData {
  const x = mkAssetClass(conf.x.asset, R)
  const y = mkAssetClass(conf.y.asset, R)
  const lq = mkAssetClass(conf.lq.asset, R)
  const nft = mkAssetClass(conf.nft.asset, R)
  const feeNum: PlutusData = R.PlutusData.new_integer(R.BigInt.from_str(conf.feeNum.toString()))
  const adminPolicy: PlutusData = R.PlutusData.new_list(R.PlutusList.new());
  const lqBound = R.PlutusData.new_integer(R.BigInt.from_str('0'))
  return mkProductN([nft, x, y, lq, feeNum, adminPolicy, lqBound], R)
}

export function mkLockLiquidityDatum(conf: LockLiquidityRequest, R: CardanoWasm): PlutusData {
  const lockedUntil = R.PlutusData.new_integer(R.BigInt.from_str(conf.lockedUntil.toString()));
  const redeemer = R.PlutusData.new_bytes(decodeHex(conf.redeemer));

  return mkProductN([lockedUntil, redeemer], R);
}

export function mkDepositDatum(conf: DepositRequest, R: CardanoWasm): PlutusData {
  const poolNft = mkAssetClass(conf.poolId, R)
  const x = mkAssetClass(conf.x.asset, R)
  const y = mkAssetClass(conf.y.asset, R)
  const lq = mkAssetClass(conf.lq, R)
  const exFee = R.PlutusData.new_integer(R.BigInt.from_str(conf.exFee.toString()))
  const rewardPkh = R.PlutusData.new_bytes(decodeHex(conf.rewardPkh))
  const stakePkh = mkMaybe(conf.stakePkh ? mkByteStringFromHex(conf.stakePkh, R) : undefined, R)
  const collateralAda = R.PlutusData.new_integer(R.BigInt.from_str(conf.collateralAda.toString()))
  return mkProductN([poolNft, x, y, lq, exFee, rewardPkh, stakePkh, collateralAda], R)
}

export function parseDepositConfig(raw: Datum, R: CardanoWasm): DepositConfig | undefined {
  const constr = parseConstrData(raw, R)
  if (constr) {
    const poolId = parseAssetClass(constr.get(0))
    const x = parseAssetClass(constr.get(1))
    const y = parseAssetClass(constr.get(2))
    const lq = parseAssetClass(constr.get(3))
    const exFee = parseInteger(constr.get(4))
    const rewardPkh = paseByteString(constr.get(5))
    const stakePkhPd = parseMaybe(constr.get(6))
    const stakePkh = stakePkhPd ? paseByteString(stakePkhPd) : undefined
    const collateralAda = parseInteger(constr.get(7))

    return poolId && x && y && lq && exFee && rewardPkh && collateralAda !== undefined
      ? {poolId, x, y, lq, exFee, rewardPkh, stakePkh, collateralAda}
      : undefined
  } else {
    return undefined
  }
}

export function mkRedeemDatum(conf: RedeemRequest, R: CardanoWasm): PlutusData {
  const poolNft = mkAssetClass(conf.poolId, R)
  const x = mkAssetClass(conf.x, R)
  const y = mkAssetClass(conf.y, R)
  const lq = mkAssetClass(conf.lq.asset, R)
  const exFee = R.PlutusData.new_integer(R.BigInt.from_str(conf.exFee.toString()))
  const rewardPkh = R.PlutusData.new_bytes(decodeHex(conf.rewardPkh))
  const stakePkh = mkMaybe(conf.stakePkh ? mkByteStringFromHex(conf.stakePkh, R) : undefined, R)
  return mkProductN([poolNft, x, y, lq, exFee, rewardPkh, stakePkh], R)
}

export function parseRedeemConfig(raw: Datum, R: CardanoWasm): RedeemConfig | undefined {
  const constr = parseConstrData(raw, R)
  if (constr) {
    const poolId = parseAssetClass(constr.get(0))
    const x = parseAssetClass(constr.get(1))
    const y = parseAssetClass(constr.get(2))
    const lq = parseAssetClass(constr.get(3))
    const exFee = parseInteger(constr.get(4))
    const rewardPkh = paseByteString(constr.get(5))
    const stakePkhPd = parseMaybe(constr.get(6))
    const stakePkh = stakePkhPd ? paseByteString(stakePkhPd) : undefined
    return poolId && x && y && lq && exFee && rewardPkh
      ? {poolId, x, y, lq, exFee, rewardPkh, stakePkh}
      : undefined
  } else {
    return undefined
  }
}

function mkProductN(members: PlutusData[], R: CardanoWasm): PlutusData {
  const bf = R.PlutusList.new()
  for (const m of members) bf.add(m)
  return mkPlutusData(bf, R)
}

export function mkMaybe(data: PlutusData | undefined, R: CardanoWasm): PlutusData {
  const bf = R.PlutusList.new()
  if (data) {
    bf.add(data)
    return R.PlutusData.new_constr_plutus_data(R.ConstrPlutusData.new(R.BigNum.zero(), bf))
  } else {
    return R.PlutusData.new_constr_plutus_data(R.ConstrPlutusData.new(R.BigNum.from_str("1"), bf))
  }
}

function parseMaybe(pd: PlutusData): PlutusData | undefined {
  const constr = pd.as_constr_plutus_data()
  if (constr) {
    return constr.alternative().is_zero() ? constr.data().get(0) : undefined
  } else {
    return undefined
  }
}

function mkByteStringFromHex(hex: HexString, R: CardanoWasm): PlutusData {
  return R.PlutusData.new_bytes(decodeHex(hex))
}

function paseByteString(pd: PlutusData): HexString | undefined {
  const bs = pd.as_bytes()
  return bs ? encodeHex(bs) : undefined
}

function mkPlutusData(members: PlutusList, R: CardanoWasm): PlutusData {
  return R.PlutusData.new_constr_plutus_data(R.ConstrPlutusData.new(R.BigNum.zero(), members))
}

export function mkAssetClass(ac: AssetClass, R: CardanoWasm): PlutusData {
  const assetClass = R.PlutusList.new()
  assetClass.add(mkByteStringFromHex(ac.policyId, R))
  assetClass.add(R.PlutusData.new_bytes(R.AssetName.from_hex(ac.nameHex).name()))
  return mkPlutusData(assetClass, R)
}

export function parseAssetClass(pd: PlutusData): AssetClass | undefined {
  const ac = pd.as_constr_plutus_data()!.data()
  const policyId = encodeHex(ac.get(0).as_bytes()!)
  const name = new TextDecoder().decode(ac.get(1).as_bytes()!)
  const hex = ac.get(1).to_hex()

  return {policyId, name, nameHex: hex}
}

function parseInteger(pd: PlutusData): bigint | undefined {
  return BigInt(pd.as_integer()?.to_str())
}
