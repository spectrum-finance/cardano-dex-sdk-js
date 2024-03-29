import * as WASM from "@emurgo/cardano-serialization-lib-browser"
import * as F from "ramda"
import {AdaPolicyId} from "../cardano/constants"
import {AdaEntry, AssetEntry} from "../cardano/entities/assetEntry"
import {TxOut} from "../cardano/entities/txOut"
import {getLovelace, Value} from "../cardano/entities/value"
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
        const nameHex = assetName.to_hex();
        const quantity = BigInt(as.get(assetName)!.to_str())
        entries.push({name: nameStr, policyId, quantity, nameHex})
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

export function toWasmValue(value: Value, R: CardanoWasm): WASM.Value {
  const assets = value.filter(v => v.policyId != AdaPolicyId)
  const groupedAssets = F.groupBy(x => x.policyId, assets)
  const wmAssets = R.MultiAsset.new()
  for (const [policy, entries] of Object.entries(groupedAssets)) {
    const wAssets = R.Assets.new()
    for (const e of entries) {
      const name = R.AssetName.from_hex(e.nameHex);
      const amt = R.BigNum.from_str(e.quantity.toString())
      wAssets.insert(name, amt)
    }
    const wPolicyId = R.ScriptHash.from_bytes(decodeHex(policy))
    wmAssets.insert(wPolicyId, wAssets)
  }
  const coins = getLovelace(value)
  const wValue = R.Value.zero()
  wValue.set_coin(R.BigNum.from_str(coins.amount.toString()))
  if (wmAssets.len()) {
    wValue.set_multiasset(wmAssets);
  }
  return wValue
}

export function encodeWasmValue(value: Value, R: CardanoWasm): HexString {
  return encodeHex(toWasmValue(value, R).to_bytes())
}

export function fromWasmUtxo(wUtxo: WASM.TransactionUnspentOutput): TxOut {
  const txHash = encodeHex(wUtxo.input().transaction_id().to_bytes())
  const index = wUtxo.input().index()
  const value = fromWasmValue(wUtxo.output().amount())
  const addr = wUtxo.output().address().to_bech32()
  const dh = wUtxo.output().data_hash()?.to_bytes()
  return {txHash, index, value, addr, dataHash: dh ? encodeHex(dh) : undefined}
}

export function decodeWasmUtxo(raw: HexString, R: CardanoWasm): TxOut {
  return fromWasmUtxo(R.TransactionUnspentOutput.from_bytes(decodeHex(raw)))
}
