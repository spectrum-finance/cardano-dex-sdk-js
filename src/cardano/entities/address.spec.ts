import test from "ava"
import {OrderAddrsV1Testnet} from "../../amm/scripts.ts"
import {RustModule} from "../../utils/rustLoader.ts"
import {Addr, extractPaymentCred} from "./address.ts"

test.before(async () => {
  await RustModule.load(true)
})

test("Refine Testnet Addrs", async t => {
  t.deepEqual(Addr(OrderAddrsV1Testnet.ammSwap, RustModule.CardanoWasm), OrderAddrsV1Testnet.ammSwap)
  t.deepEqual(Addr(OrderAddrsV1Testnet.ammDeposit, RustModule.CardanoWasm), OrderAddrsV1Testnet.ammDeposit)
  t.deepEqual(Addr(OrderAddrsV1Testnet.ammRedeem, RustModule.CardanoWasm), OrderAddrsV1Testnet.ammRedeem)
})

const CARDANO_TESTNET_ADDRESS =
  "addr_test1qrw8rudvdxe96q3kunwpz7ft3x9nfn7hmffycklp8mes4g3gdwtphucr89u499xx09hzt54efg30e5ytw986gkzd2gpsz3fstu"

const CARDANO_EXPECTED_PAYMENT_CREDS = "dc71f1ac69b25d0236e4dc11792b898b34cfd7da524c5be13ef30aa2"

test("Extract payment creds returns valid payment creds", async t => {
  t.is(extractPaymentCred(CARDANO_TESTNET_ADDRESS, RustModule.CardanoWasm), CARDANO_EXPECTED_PAYMENT_CREDS)
})
