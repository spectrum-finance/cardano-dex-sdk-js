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
  ammPool: "b9eebc6add3b4684debb0d91c5da5677ae308279786c1e955ee34942",
  ammDeposit: "075e09eb0fa89e1dc34691b3c56a7f437e60ac5ea67b338f2e176e20",
  ammRedeem: "83da79f531c19f9ce4d85359f56968a742cf05cc25ed3ca48c302dee",
  ammSwap: "18f16aa47943ee2aea9e9deddbad458a02c656480fae5c3e2343ce92"
}

