import test from "ava"
import {Quickblue} from "../../quickblue/cardanoNetwork"
import {RustModule} from "../../utils/rustLoader"
import {mkPoolsParser} from "../parsers/poolsParser"
import {ScriptCredsV1} from "../scripts"
import {mkNetworkPoolsV1} from "./pools"

test.before(async () => {
  await RustModule.load(true)
})

test("Parse Pools in batch", async t => {
  const parser = mkPoolsParser(RustModule.CardanoWasm)
  const network = new Quickblue("https://testnet-api.quickblue.io/v1")
  const pools = mkNetworkPoolsV1(network, parser, ScriptCredsV1)
  const res = await pools.getAll({offset: 0, limit: 10})
  t.notThrows(() => res)
})
