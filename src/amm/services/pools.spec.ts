import test from "ava"
import {Quickblue} from "../../quickblue/cardanoNetwork.js"
import {RustModule} from "../../utils/rustLoader.js"
import {mkPoolsParser} from "../parsers/poolsParser.js"
import {ScriptCredsV1} from "../scripts.js"
import {mkNetworkPoolsV1} from "./pools.js"

test.before(async () => {
  await RustModule.load({env: "nodejs"})
})

test("Parse Pools in batch", async t => {
  const parser = mkPoolsParser(RustModule.CardanoWasm)
  const network = new Quickblue("https://testnet-api.quickblue.io/v1")
  const pools = mkNetworkPoolsV1(network, parser, ScriptCredsV1)
  const res = await pools.getAll({offset: 0, limit: 10})
  t.notThrows(() => res)
})
