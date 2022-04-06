import {HexString} from "../cardano/types"

export const NativePoolAddr = ""

export const NativeOrders = {
  depositAddr: "",
  redeemAddr: "",
  swapAddr: ""
}

export type ScriptCreds = {
  ammPoolV1: HexString
  ammDepositV1: HexString
  ammRedeemV1: HexString
  ammSwapV1: HexString
}
