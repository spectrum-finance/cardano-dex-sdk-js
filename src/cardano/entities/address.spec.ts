import test from "ava"
import {OrderAddrsV1Testnet} from "../../amm/scripts"
import {RustModule} from "../../utils/rustLoader"
import {Addr, extractPaymentCred} from "./address"

test.before(async () => {
  await RustModule.load(true)
})

test("Refine Testnet Addrs", async t => {
  t.deepEqual(Addr(OrderAddrsV1Testnet.ammSwapDefault, RustModule.CardanoWasm), OrderAddrsV1Testnet.ammSwapDefault)
  t.deepEqual(Addr(OrderAddrsV1Testnet.ammDepositDefault, RustModule.CardanoWasm), OrderAddrsV1Testnet.ammDepositDefault)
  t.deepEqual(Addr(OrderAddrsV1Testnet.ammRedeemDefault, RustModule.CardanoWasm), OrderAddrsV1Testnet.ammRedeemDefault)
})

const CARDANO_TESTNET_ADDRESS =
  "addr_test1qrw8rudvdxe96q3kunwpz7ft3x9nfn7hmffycklp8mes4g3gdwtphucr89u499xx09hzt54efg30e5ytw986gkzd2gpsz3fstu"

const CARDANO_EXPECTED_PAYMENT_CREDS =
  "dc71f1ac69b25d0236e4dc11792b898b34cfd7da524c5be13ef30aa2"

test("Extract payment creds returns valid payment creds", async t => {
  t.is(extractPaymentCred(CARDANO_TESTNET_ADDRESS, RustModule.CardanoWasm), CARDANO_EXPECTED_PAYMENT_CREDS);
})

