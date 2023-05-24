import test from "ava"
import {emptyValue} from "../../cardano/entities/value.ts"
import {AssetAmount} from "../../domain/assetAmount.ts"
import {encodeHex} from "../../utils/hex.ts"
import {RustModule} from "../../utils/rustLoader.ts"
import {mkDepositDatum, mkRedeemDatum, mkSwapDatum, parsePoolConfig} from "../contractData.ts"
import {DepositRequest, OrderKind, RedeemRequest, SwapRequest} from "../models/opRequests.ts"
import {PoolConfig} from "../models/poolConfig.ts"

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
  const expected: PoolConfig = {
    ...poolTokens,
    feeNum: poolFeeNum
  }
  t.deepEqual(parsePoolConfig(sampleHex, RustModule.CardanoWasm), expected)
})

test("Construct valid Swap datum", async t => {
  const sampleHex =
    "d8799fd8799f417846706f6f6c5f78ffd8799f417946706f6f6c5f79ffd8799f436e6674" +
    "48706f6f6c5f6e6674ff1903e31a002625a001581cd74d26c5029cf290094fce1a0670da" +
    "7369b9026571dfb977c6fa234fd87a800201ff"
  const swapReq: SwapRequest = {
    kind: OrderKind.Swap,
    poolId: poolTokens.nft,
    rewardPkh: rewardPkh,
    stakePkh: undefined,
    poolFeeNum: poolFeeNum,
    baseInput: new AssetAmount(poolTokens.x, 2n),
    quoteAsset: poolTokens.y,
    minQuoteOutput: 1n,
    exFeePerToken: {numerator: 2500000n, denominator: 1n},
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
    "417946706f6f6c5f79ffd8799f426c7147706f6f6c5f6c71ff02581cd74d26c5029cf290" +
    "094fce1a0670da7369b9026571dfb977c6fa234fd87a8001ff"
  const depositReq: DepositRequest = {
    kind: OrderKind.Deposit,
    poolId: poolTokens.nft,
    x: new AssetAmount(poolTokens.x, 0n),
    y: new AssetAmount(poolTokens.y, 0n),
    lq: poolTokens.lq,
    rewardPkh: rewardPkh,
    stakePkh: undefined,
    exFee: 2n,
    uiFee: 100n,
    collateralAda: 1n,
    orderValue: emptyValue
  }
  const datum = mkDepositDatum(depositReq, RustModule.CardanoWasm)
  const datumHex = encodeHex(datum.to_bytes())
  t.deepEqual(datumHex, sampleHex)
})

test("Construct valid Redeem datum", async t => {
  const sampleHex =
    "d8799fd8799f436e667448706f6f6c5f6e6674ffd8799f417846706f6f6c5f78ffd8799f" +
    "417946706f6f6c5f79ffd8799f426c7147706f6f6c5f6c71ff02581cd74d26c5029cf290" +
    "094fce1a0670da7369b9026571dfb977c6fa234fd8799f581cd74d26c5029cf290094fce" +
    "1a0670da7369b9026571dfb977c6fa234fffff"
  const redeemReq: RedeemRequest = {
    kind: OrderKind.Redeem,
    poolId: poolTokens.nft,
    x: poolTokens.x,
    y: poolTokens.y,
    lq: new AssetAmount(poolTokens.lq, 0n),
    rewardPkh: rewardPkh,
    stakePkh: rewardPkh,
    exFee: 2n,
    uiFee: 100n,
    orderValue: emptyValue
  }
  const datum = mkRedeemDatum(redeemReq, RustModule.CardanoWasm)
  const datumHex = encodeHex(datum.to_bytes())
  t.deepEqual(datumHex, sampleHex)
})
