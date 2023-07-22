import test from "ava"
import {AdaAssetName, AdaPolicyId} from "../cardano/constants"
import {RustModule} from "../utils/rustLoader"
import {decodeWasmUtxo, decodeWasmValue, encodeWasmValue} from "./serlib"

test.before(async () => {
  await RustModule.load(true)
})

test("Encode/decode Value", async t => {
  const sample =
    "821a007b20cba1581c6ac8ef33b510ec004fe11585f7c5a9f0c07f0c23428ab4f29c1d7d10a1444d454c441a00017414"
  const r = decodeWasmValue(sample, RustModule.CardanoWasm)
  t.deepEqual(r, [
    {
      name: "MELD",
      policyId: "6ac8ef33b510ec004fe11585f7c5a9f0c07f0c23428ab4f29c1d7d10",
      quantity: 95252n,
      nameHex: ''
    },
    {
      name: "",
      policyId: "",
      quantity: 8069323n,
      nameHex: ''
    }
  ])
  const encoded = encodeWasmValue(r, RustModule.CardanoWasm)
  t.deepEqual(encoded, sample)
})

test("Encode/decode UTXO", async t => {
  const sample =
    "82825820361f17b12cbfcedc607d2bb690079b60bf38aa60577406c3b033a7413e89581f0182583901f62ccc5df2270b4450e55e39bb60cc0b19ef6498ac280ce854a3daa44c06673ad29cbd475cfaaf68ee4c3bf081913eeeab9393ee012bed4c1a00a49d68"
  const r = decodeWasmUtxo(sample, RustModule.CardanoWasm)
  t.deepEqual(r, {
    addr: "addr1q8mzenza7gnsk3zsu40rnwmqes93nmmynzkzsr8g2j3a4fzvqenn455uh4r4e740drhycwlssxgnam4tjwf7uqfta4xq3pnxx8",
    dataHash: undefined,
    index: 1,
    txHash: "361f17b12cbfcedc607d2bb690079b60bf38aa60577406c3b033a7413e89581f",
    value: [
      {
        policyId: AdaPolicyId,
        name:     AdaAssetName,
        nameHex:  '',
        quantity: 10788200n
      }
    ]
  })
})
