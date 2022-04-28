import {HexString} from "../cardano/types"

export type OrderAddrs = {
  ammDeposit: HexString
  ammRedeem: HexString
  ammSwap: HexString
}

export const OrderAddrsV1Testnet: OrderAddrs = {
  ammDeposit: "addr_test1wzs0df8en2dage286us3xgv2mwf0yekj9wddud04gwe9p7sgd4ug7",
  ammRedeem: "addr_test1wpl7emjypvc2hskfahcq6ttvgeuakua5397cslktfwe9hzg6wxh5g",
  ammSwap: "addr_test1wrx2hy06cqkwkc3gr4nddrs30t8z4vvhlsltz2ffhxvu5vg88208n"
}

export type ScriptCreds = {
  ammPool: HexString
  ammDeposit: HexString
  ammRedeem: HexString
  ammSwap: HexString
}

export const ScriptCredsV1: ScriptCreds = {
  ammPool: "072149fd793f49edebeafe6b242f25cac72fd7fc0c0f9e6bbe18f260",
  ammDeposit: "",
  ammRedeem: "",
  ammSwap: ""
}
