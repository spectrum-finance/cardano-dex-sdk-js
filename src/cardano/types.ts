export type HexString = string
export type Bech32String = string

export type Hash32 = HexString
export type Hash28 = HexString

export type ScriptHash = HexString

export type Script = HexString

export type MintingPolicy = Script

export type PolicyId = ScriptHash
export type AssetName = string

export type AssetRef = string

export type Lovelace = bigint

export type TxHash = Hash32
export type BlockHash = Hash32

export type OutputRef = string

export type Slot = number

export type ValidityRange = [Slot, Slot]

export type Addr = Bech32String
export type PaymentCred = HexString
