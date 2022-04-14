import {HexString} from "../cardano/types"

export type OrderAddrs = {
  ammDeposit: HexString
  ammRedeem: HexString
  ammSwap: HexString
}

export const OrderAddrsV1: OrderAddrs = {
  ammDeposit: "addr_test1wz7dga0aws836aczvpc84pnwu8uxy3n3qnqzcy3njj3j9mqnwc6xa",
  ammRedeem: "addr_test1wzg0he87708wywu7mwq75pcqpuvkd9kydklyfxh7vjrz65g9cfd2w",
  ammSwap: "addr_test1wpe2d075jnnhyj24dce8ukyrwyry4a570d9n3ydcuh0yv6qk8dvr7"
}

export type ScriptCreds = {
  ammPool: HexString
  ammDeposit: HexString
  ammRedeem: HexString
  ammSwap: HexString
}

export const ScriptCredsV1: ScriptCreds = {
  ammPool: "32213c4939bdbaa294394e792099e58f5f2b7dd6013f6fd1610cc4c8",
  ammDeposit: "",
  ammRedeem: "",
  ammSwap: ""
}
