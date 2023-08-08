import test from "ava"
import {RustModule} from "../../../utils/rustLoader"
import {mkDatumSchema} from "../../../utils/datum/datumSchema"
import {AssetClass} from "../../../cardano/entities/assetClass"
import {HexString} from "../../../cardano/types"
import {DatumBigint} from "../../../utils/datum/types/DatumBigint"
import {DatumAssetClass} from "../../../utils/datum/types/DatumAssetClass"
import {DatumInt} from "../../../utils/datum/types/DatumInt"
import {DatumMaybe} from "../../../utils/datum/types/DatumMaybe"
import {DatumByteString} from "../../../utils/datum/types/DatumByteString"

test.before(async () => {
  await RustModule.load(true)
})

const poolTokens = {
  lq: {
    name: "pool_lq",
    policyId: "6c71",
    nameHex: '47706f6f6c5f6c71'
  },
  nft: {
    name: "pool_nft",
    policyId: "6e6674",
    nameHex:'48706f6f6c5f6e6674'
  },
  x: {
    name: "pool_x",
    policyId: "78",
    nameHex:'46706f6f6c5f78'
  },
  y: {
    name: "pool_y",
    policyId: "79",
    nameHex: '46706f6f6c5f79'
  }
}
const poolFeeNum = 995
const rewardPkh = "d74d26c5029cf290094fce1a0670da7369b9026571dfb977c6fa234f"

interface SwapDatum {
  readonly base: AssetClass;
  readonly quote: AssetClass;
  readonly poolNft: AssetClass;
  readonly feeNum: number;
  readonly feePerTokenNum: bigint;
  readonly feePerTokenDen: bigint;
  readonly rewardPkh: HexString;
  readonly stakePkh?: HexString;
  readonly baseAmount: bigint;
  readonly minQuoteAmount: bigint;
}

test("Parse Swap datum", async t => {
  const swapDatumSchema = mkDatumSchema<SwapDatum>({
    base:           {position: 0, type: DatumAssetClass},
    quote:          {position: 1, type: DatumAssetClass},
    poolNft:        {position: 2, type: DatumAssetClass},
    feeNum:         {position: 3, type: DatumInt},
    // Execution fee numerator (feePerTokenNum / feePerTokenDen = feePerToken)
    feePerTokenNum: {position: 4, type: DatumBigint},
    // Execution fee denominator (feePerTokenNum / feePerTokenDen = feePerToken)
    feePerTokenDen: {position: 5, type: DatumBigint},
    rewardPkh:      {position: 6, type: DatumByteString},
    stakePkh:       {position: 7, type: DatumMaybe(DatumByteString)},
    baseAmount:     {position: 8, type: DatumBigint},
    minQuoteAmount: {position: 9, type: DatumBigint}
  }, RustModule.CardanoWasm);

  const sampleHex =
    "d8799fd8799f417846706f6f6c5f78ffd8799f417946706f6f6c5f79ffd8799f436e6674" +
    "48706f6f6c5f6e6674ff1903e31a002625a001581cd74d26c5029cf290094fce1a0670da" +
    "7369b9026571dfb977c6fa234fd87a800201ff"

  const swapDatum: SwapDatum = {
    base: poolTokens.x,
    quote: poolTokens.y,
    poolNft: poolTokens.nft,
    feeNum: poolFeeNum,
    feePerTokenDen: 1n,
    feePerTokenNum: 2500000n,
    minQuoteAmount: 1n,
    baseAmount: 2n,
    rewardPkh: rewardPkh,
    stakePkh: undefined
  };
  console.log(swapDatumSchema.fromHex(sampleHex));
  t.deepEqual(swapDatumSchema.fromHex(sampleHex), swapDatum)
})
