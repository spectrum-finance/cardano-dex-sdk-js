import test from "ava"
import {RustModule} from "../../utils/rustLoader"
import {pubKeyHashFromAddr, pubKeyHashFromRawAddr} from "./publicKey"

test.before(async () => {
  await RustModule.load(true)
})

const keyHash = "f62ccc5df2270b4450e55e39bb60cc0b19ef6498ac280ce854a3daa4"
const bech32Addr =
  "addr1q8mzenza7gnsk3zsu40rnwmqes93nmmynzkzsr8g2j3a4fzvqenn455uh4r4e740drhycwlssxgnam4tjwf7uqfta4xq3pnxx8"
const rawAddr =
  "01f62ccc5df2270b4450e55e39bb60cc0b19ef6498ac280ce854a3daa44c06673ad29cbd475cfaaf68ee4c3bf081913eeeab9393ee012bed4c"

test("Parse Addr", async t => {
  const r = pubKeyHashFromAddr(bech32Addr)
  t.deepEqual(r, keyHash)
})

test("Parse RawAddr", async t => {
  const r = pubKeyHashFromRawAddr(rawAddr)
  t.deepEqual(r, keyHash)
})
