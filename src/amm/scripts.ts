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
  ammPool: "83691180a7b11bcbb7066d56cec3b71c515ce859eea84dfcd755cb53",
  ammDeposit: "83c7f944ab1f659df6f3c6b27bd75b4be73aa4b4352895f18f6048aa",
  ammRedeem: "3c2a206fea2c88323d8eadf6e1a983cfa95c3f1b067cefb3245bb715",
  ammSwap: "d544ed393b7315fe5f5424d31c50509e4652e5053595dcd397bb862d"
}

