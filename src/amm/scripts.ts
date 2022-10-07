import {HexString} from "../cardano/types"

export type OrderAddrs = {
  ammDeposit: HexString
  ammRedeem: HexString
  ammSwap: HexString
}

export const OrderAddrsV1Testnet: OrderAddrs = {
  ammDeposit: "addr_test1wqr4uz0tp75fu8wrg6gm83t20aphuc9vt6n8kvu09ctkugq6ch8kj",
  ammRedeem: "addr_test1wzpa5704x8qel88ympf4natfdzn59nc9esj7609y3sczmmsxcd9lz",
  ammSwap: "addr_test1wqv0z64y09p7u2h2n6w7mkadgk9q93jkfq86uhp7ydpuays0cetvn"
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

