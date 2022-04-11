import test from "ava"
import {RustModule} from "../utils/rustLoader"
import {decodeWasmValue} from "./serlib"

test.before(async () => {
  await RustModule.load(true)
})

test("Parse Value", async t => {
  const sample =
    "821a007b20cba1581c6ac8ef33b510ec004fe11585f7c5a9f0c07f0c23428ab4f29c1d7d10a1444d454c441a00017414"
  const r = decodeWasmValue(sample, RustModule.CardanoWasm)
  t.deepEqual(r, [
    {
      name: "MELD",
      policyId: "6ac8ef33b510ec004fe11585f7c5a9f0c07f0c23428ab4f29c1d7d10",
      quantity: 95252n
    },
    {
      name: "",
      policyId: "",
      quantity: 8069323n
    }
  ])
})
