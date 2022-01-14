import test from "ava"
import {AssetClass} from "../../cardano/entities/assetClass"
import {encodeHex} from "../../utils/hex"
import {renderPlutusDataTreeUnsafe} from "../../utils/plutus"
import {RustModule} from "../../utils/rustLoader"
import {mkAssetClass, parsePoolDatum} from "../contractData"

test.before(async () => {
  await RustModule.load(true)
})

test("Construct valid Pool Datum", async t => {
  const raw =
    "d8799fd8799f581c805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da4a544f4b454e5f4e46540affd8799f581c805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da48544f4b454e5f410affd8799f581c805fe1efcdea11f1e959eff4f422f118aa76dca2d0d797d184e487da48544f4b454e5f420affd8799f581c97d96c529c5f6e74515f79d07dff6229aa989fef9114befed45e40a449544f4b454e5f4c500aff01ff"
  t.log(renderPlutusDataTreeUnsafe(raw, RustModule.CardanoWasm))
  t.log(parsePoolDatum(raw, RustModule.CardanoWasm))
})

test("Construct valid Swap Datum", async t => {
  const raw =
    "d8799fd8799f45baffeebcdc45dfdaeecbeaffd8799f45cecccafcfa45babbaadeabffd8799f45efffaafebc45bdfcffbdbfff186118640345bbeaecdcba182b1822ff"
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
