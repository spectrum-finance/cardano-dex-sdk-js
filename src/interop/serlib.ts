import * as WASM from "@emurgo/cardano-serialization-lib-browser"
import {AdaEntry, AssetEntry} from "../cardano/entities/assetEntry"
import {Value} from "../cardano/entities/value"
import {HexString, PolicyId} from "../cardano/types"
import {decodeHex, encodeHex} from "../utils/hex"
import {CardanoWasm} from "../utils/rustLoader"

export function fromWasmValue(value: WASM.Value): Value {
  const adaEntry = AdaEntry(BigInt(value.coin().to_str()))
  const ma = value.multiasset()
  if (ma) {
    const policies = ma.keys()
    const numPolicies = policies.len()
    const assetsGrouped: [PolicyId, WASM.Assets][] = []
    const totalEntries: AssetEntry[] = []
    for (let i = 0; i < numPolicies; i++) {
      const p = policies.get(i)
      const policyId = encodeHex(p.to_bytes())
      assetsGrouped.push([policyId, ma.get(p)!])
    }
    for (const [policyId, as] of assetsGrouped) {
      const assets = as.keys()
      const numAssets = assets.len()
      const entries: AssetEntry[] = []
      for (let i = 0; i < numAssets; i++) {
        const assetName = assets.get(i)
        const nameStr = new TextDecoder().decode(assetName.name())
        const quantity = BigInt(as.get(assetName)!.to_str())
        entries.push({name: nameStr, policyId, quantity})
      }
      totalEntries.push(...entries)
    }
    totalEntries.push(adaEntry)
    return totalEntries
  }
  return [adaEntry]
}

export function decodeWasmValue(raw: HexString, R: CardanoWasm): Value {
  return fromWasmValue(R.Value.from_bytes(decodeHex(raw)))
}
