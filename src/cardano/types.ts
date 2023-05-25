import {AssetClass} from "./entities/assetClass.js"

export type HexString = string
export type Bech32String = string

export type Hash32 = HexString
export type Hash28 = HexString

export type ScriptHash = HexString

export type Script = HexString
export type Redeemer = HexString
export type Datum = HexString

export type MintingPolicy = Script

export type Subject = ScriptHash
export type PolicyId = ScriptHash
export type AssetName = string

export type AssetRef = string

export function mkAssetRef(ac: AssetClass): AssetRef {
  return `${ac.policyId}.${ac.name}`
}

export type Lovelace = bigint

export type TxHash = Hash32
export type BlockHash = Hash32

export type TxOutRef = string

export function mkTxOutRef(txHash: TxHash, index: number): TxOutRef {
  return `${txHash}#${index}`
}

export type Slot = bigint

export type ValidityRange = [Slot, Slot]

export type PaymentCred = HexString
