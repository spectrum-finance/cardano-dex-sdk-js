import test from "ava"
import {emptyValue} from "../../cardano/entities/value"
import {AssetAmount} from "../../domain/assetAmount"
import {encodeHex} from "../../utils/hex"
import {RustModule} from "../../utils/rustLoader"
import {mkDepositDatum, mkRedeemDatum, mkSwapDatum, parsePoolDatum} from "../contractData"
import {DepositRequest, OrderKind, RedeemRequest, SwapRequest} from "../models/opRequests"
import {PoolDatum} from "../models/poolDatum"

test.before(async () => {
  await RustModule.load(true)
})

const poolTokens = {
  lq: {
    name: "pool_lq",
    policyId: "6c71"
  },
  nft: {
    name: "pool_nft",
    policyId: "6e6674"
  },
  x: {
    name: "pool_x",
    policyId: "78"
  },
  y: {
    name: "pool_y",
    policyId: "79"
  }
}

const poolFeeNum = 995

const rewardPkh = "d74d26c5029cf290094fce1a0670da7369b9026571dfb977c6fa234f"

test("Parse Pool datum", async t => {
  const sampleHex =
    "d8799fd8799f436e667448706f6f6c5f6e6674ffd8799f417846706f6f6c5f78ffd8799f" +
    "417946706f6f6c5f79ffd8799f426c7147706f6f6c5f6c71ff1903e3ff"
  const expected: PoolDatum = {
    ...poolTokens,
    feeNum: poolFeeNum
  }
  t.deepEqual(parsePoolDatum(sampleHex, RustModule.CardanoWasm), expected)
})

test("Construct valid Swap datum", async t => {
  const sampleHex =
    "d8799fd8799f417846706f6f6c5f78ffd8799f417946706f6f6c5f79ffd8799f436e6674" +
    "48706f6f6c5f6e6674ff1903e30a14581cd74d26c5029cf290094fce1a0670da7369b902" +
    "6571dfb977c6fa234f1864190190ff"
  const swapReq: SwapRequest = {
    kind: OrderKind.Swap,
    poolId: poolTokens.nft,
    rewardPkh: rewardPkh,
    poolFeeNum: poolFeeNum,
    baseInput: new AssetAmount(poolTokens.x, 100n),
    quoteAsset: poolTokens.y,
    minQuoteOutput: 400n,
    exFeePerToken: {numerator: 10n, denominator: 20n},
    uiFee: 100n,
    orderValue: emptyValue
  }
  const datum = mkSwapDatum(swapReq, RustModule.CardanoWasm)
  const datumHex = encodeHex(datum.to_bytes())
  t.deepEqual(datumHex, sampleHex)
})

test("Construct valid Deposit datum", async t => {
  const sampleHex =
    "d8799fd8799f436e667448706f6f6c5f6e6674ffd8799f417846706f6f6c5f78ffd8799f" +
    "417946706f6f6c5f79ffd8799f426c7147706f6f6c5f6c71ff1864581cd74d26c5029cf2" +
    "90094fce1a0670da7369b9026571dfb977c6fa234f1901f4ff"
  const depositReq: DepositRequest = {
    kind: OrderKind.Deposit,
    poolId: poolTokens.nft,
    x: new AssetAmount(poolTokens.x, 0n),
    y: new AssetAmount(poolTokens.y, 0n),
    lq: poolTokens.lq,
    rewardPkh: rewardPkh,
    exFee: 100n,
    uiFee: 100n,
    collateralAda: 500n,
    orderValue: emptyValue
  }
  const datum = mkDepositDatum(depositReq, RustModule.CardanoWasm)
  const datumHex = encodeHex(datum.to_bytes())
  t.deepEqual(datumHex, sampleHex)
})

test("Construct valid Redeem datum", async t => {
  const sampleHex =
    "d8799fd8799f436e667448706f6f6c5f6e6674ffd8799f417846706f6f6c5f78ffd8799f" +
    "417946706f6f6c5f79ffd8799f426c7147706f6f6c5f6c71ff1864581cd74d26c5029cf2" +
    "90094fce1a0670da7369b9026571dfb977c6fa234fff"
  const redeemReq: RedeemRequest = {
    kind: OrderKind.Redeem,
    poolId: poolTokens.nft,
    x: poolTokens.x,
    y: poolTokens.y,
    lq: new AssetAmount(poolTokens.lq, 0n),
    rewardPkh: rewardPkh,
    exFee: 100n,
    uiFee: 100n,
    orderValue: emptyValue
  }
  const datum = mkRedeemDatum(redeemReq, RustModule.CardanoWasm)
  const datumHex = encodeHex(datum.to_bytes())
  t.deepEqual(datumHex, sampleHex)
})
