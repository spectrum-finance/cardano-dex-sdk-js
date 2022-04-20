import {HexString} from "../cardano/types"

export type OrderAddrs = {
  ammDeposit: HexString
  ammRedeem: HexString
  ammSwap: HexString
}

export const OrderAddrsV1Testnet: OrderAddrs = {
  ammDeposit: "addr_test1wq373plcv2z25nu3uf4tmpvkc460cneucqfcnqecphplkvs9dstfw",
  ammRedeem: "addr_test1wqpzdfz0tn4juc9y0nqwl6hq0wn2w0jwffvqnj0nr9mjfsqz0lj5t",
  ammSwap: "addr_test1wq7g34n9je3putggyhnar9e49nvtcnh89wltarwgzc2cppqe73pz0"
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
