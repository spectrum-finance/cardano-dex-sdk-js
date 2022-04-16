import test from "ava"
import {OrderAddrsV1Testnet} from "../../amm/scripts"
import {RustModule} from "../../utils/rustLoader"
import {Addr} from "./address"

test.before(async () => {
  await RustModule.load(true)
})

test("Refine Testnet Addrs", async t => {
  t.deepEqual(Addr(OrderAddrsV1Testnet.ammSwap, RustModule.CardanoWasm), OrderAddrsV1Testnet.ammSwap)
  t.deepEqual(Addr(OrderAddrsV1Testnet.ammDeposit, RustModule.CardanoWasm), OrderAddrsV1Testnet.ammDeposit)
  t.deepEqual(Addr(OrderAddrsV1Testnet.ammRedeem, RustModule.CardanoWasm), OrderAddrsV1Testnet.ammRedeem)
})
