import test from "ava"
import {decodeHex, encodeHex} from "../../utils/hex"
import {RustModule} from "../../utils/rustLoader"

test.before(async () => {
  await RustModule.load(true)
})

test("Contract template hash calculation: Pool", async t => {
  const R = RustModule.CardanoWasm
  const raw = "d8799f0a02ff"
  const datumReconstructed = R.PlutusData.from_bytes(decodeHex(raw))
  t.log(datumReconstructed.as_constr_plutus_data()!.alternative().to_str())
  t.log(datumReconstructed.as_constr_plutus_data()!.data().get(0).as_integer()!.to_str())
  t.log(datumReconstructed.as_constr_plutus_data()!.data().get(1).as_integer()!.to_str())

  const plst = R.PlutusList.new()
  plst.add(R.PlutusData.new_integer(R.BigInt.from_str("10")))
  plst.add(R.PlutusData.new_integer(R.BigInt.from_str("2")))
  const eqv = R.ConstrPlutusData.new(R.BigNum.zero(), plst)
  const eqvHex = encodeHex(eqv.to_bytes())
  t.log(eqvHex)

  t.deepEqual(raw, eqvHex)
})
