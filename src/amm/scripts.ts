import {HexString} from "../cardano/types"

export type OrderAddrs = {
  ammDeposit: HexString
  ammRedeem: HexString
  ammSwap: HexString
}

export const OrderAddrsV1Testnet: OrderAddrs = {
  ammDeposit: "addr_test1wqr4uz0tp75fu8wrg6gm83t20aphuc9vt6n8kvu09ctkugq6ch8kj",
  ammRedeem: "addr_test1wzpa5704x8qel88ympf4natfdzn59nc9esj7609y3sczmmsxcd9lz",
  ammSwap: "addr_test1wzqtdp6lxhc27rdyhm5rxu43hr4gq0hzuq8l4k8w5zd5wdqstw4uw"
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
  ammSwap: "80b6875f35f0af0da4bee83372b1b8ea803ee2e00ffad8eea09b4734"
}

