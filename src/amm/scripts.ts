import {HexString} from "../cardano/types"

export type OrderAddrs = {
  ammDeposit: HexString
  ammRedeem: HexString
  ammSwap: HexString
}

export const OrderAddrsV1: OrderAddrs = {
  ammDeposit: "",
  ammRedeem: "",
  ammSwap: ""
}

export type ScriptCreds = {
  ammPool: HexString
  ammDeposit: HexString
  ammRedeem: HexString
  ammSwap: HexString
}

export const ScriptCredsV1: ScriptCreds = {
  ammPool: "945df40532805976ce4c3278c102025e780b8107360efdee9d6e9c34",
  ammDeposit: "",
  ammRedeem: "",
  ammSwap: ""
}
