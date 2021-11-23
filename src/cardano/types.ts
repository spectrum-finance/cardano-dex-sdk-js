export type Base16 = string
export type Bech32 = string

export type Hash32 = Base16
export type Hash28 = Base16

export type ScriptHash = Base16

export type Script = Base16

export type MintingPolicy = Script

export type PolicyId = ScriptHash
export type AssetName = string

export type AssetRef = string

export type Lovelace = bigint

export type TxHash = Hash32

export type OutputRef = string

export type Slot = number

export type Addr = Bech32
export type PaymentCred = Base16
