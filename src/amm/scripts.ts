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
  ammPool: "16e0ada5bd12f81108c67f9b1bd6467e5bbcca823e99edbe3dcb2fe5",
  ammDeposit: "",
  ammRedeem: "",
  ammSwap: ""
}
