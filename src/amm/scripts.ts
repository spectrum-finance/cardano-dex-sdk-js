import {HexString} from "../cardano/types"

export type OrderAddrs = {
  ammDeposit: HexString
  ammRedeem: HexString
  ammSwap: HexString
}

export const OrderAddrsV1Testnet: OrderAddrs = {
  ammDeposit: "addr_test1wzpu072y4v0kt80k70rty77htd97ww4yks6j39033asy32sswjg62",
  ammRedeem: "addr_test1wq7z5gr0agkgsv3a36kldcdfs086jhplrvr8emany3dmw9g4t6yxh",
  ammSwap: "addr_test1wr25fmfe8de3tljl2sjdx8zs2z0yv5h9q56ethxnj7acvtglthg75"
}

export type ScriptCreds = {
  ammPool: HexString
  ammDeposit: HexString
  ammRedeem: HexString
  ammSwap: HexString
}

export const ScriptCredsV1: ScriptCreds = {
  ammPool: "a258f896dff1d01ac9a8bd0598304b933a8f3e9e0953938767178099",
  ammDeposit: "075e09eb0fa89e1dc34691b3c56a7f437e60ac5ea67b338f2e176e20",
  ammRedeem: "83da79f531c19f9ce4d85359f56968a742cf05cc25ed3ca48c302dee",
  ammSwap: "18f16aa47943ee2aea9e9deddbad458a02c656480fae5c3e2343ce92"
}

