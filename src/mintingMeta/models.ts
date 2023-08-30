import {HexString, TxHash} from "../cardano/types";

export type MintingDataRequest = {
  txHash: TxHash
  index: number
  tnName: HexString
  qty: number
}

export type MintingDataResponse = {
  policyId: HexString
  script: HexString
}
