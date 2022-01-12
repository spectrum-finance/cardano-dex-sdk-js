import test from "ava"
import {AssetClass} from "../../cardano/entities/assetClass"
import {encodeHex} from "../../utils/hex"
import {renderPlutusDataTreeUnsafe} from "../../utils/plutus"
import {RustModule} from "../../utils/rustLoader"
import {mkAssetClass, mkSwapDatum} from "../contractData"

test.before(async () => {
  await RustModule.load(true)
})

test("Construct valid Swap Datum", async t => {
  const raw = "d8799fd8799f45baffeebcdc45dfdaeecbeaffd8799f45cecccafcfa45babbaadeabffd8799f45efffaafebc45bdfcffbdbfff186118640345bbeaecdcba182b1822ff"
  t.log(renderPlutusDataTreeUnsafe(raw, RustModule.CardanoWasm))
})

test("Construct valid Deposit Datum", async t => {
  const raw = "d8799fd8799f45deceaeaabb45cadebdfdaeff0b45feeeeccbdd1837ff"
  t.log(renderPlutusDataTreeUnsafe(raw, RustModule.CardanoWasm))
})

test("Construct valid Redeem Datum", async t => {
  const raw = "d8799fd8799f45dbeadfeaed45efaebdabbfff0145ebaaecaecaff"
  t.log(renderPlutusDataTreeUnsafe(raw, RustModule.CardanoWasm))
})

test("AssetClass", async t => {
  const ac: AssetClass = {policyId: "45eaffebffaf", name: "45feffebdeda"}
  const dt = mkAssetClass(ac, RustModule.CardanoWasm)
  const raw = encodeHex(dt.to_bytes())
  t.log(renderPlutusDataTreeUnsafe(raw, RustModule.CardanoWasm))
})

test("SwapDatum", async t => {
  const base: AssetClass = {policyId: "45baffeebcdc", name: "45dfdaeecbea"}
  const quote: AssetClass = {policyId: "45cecccafcfa", name: "45babbaadeab"}
  const poolNft: AssetClass = {policyId: "45efffaafebc", name: "45bdfcffbdbf"}
  const dt = mkSwapDatum({
    base,
    quote,
    poolNft,
    feeNum: 97n,
    feePerToken: {numerator: 100n, denominator: 3n},
    rewardPkh: "45bbeaecdcba",
    baseAmount: 43n,
    minQuoteAmount: 34n
  }, RustModule.CardanoWasm)
  const raw = encodeHex(dt.to_bytes())
  t.log(renderPlutusDataTreeUnsafe(raw, RustModule.CardanoWasm))
})
