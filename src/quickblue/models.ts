import {SAddr} from "../cardano/entities/address"
import {Tx} from "../cardano/entities/tx"
import {TxIn} from "../cardano/entities/txIn"
import {FullTxOut, TxOut} from "../cardano/entities/txOut"
import {Value} from "../cardano/entities/value"
import {BlockHash, Hash32, HexString, TxHash} from "../cardano/types"
import {notImplemented} from "../utils/notImplemented"

export type Items<T> = {
  items: T[]
  total: number
}

export type QuickblueTxOut = {
  value: Value
  addr: SAddr
  dataHash?: Hash32
  data?: JSON
}

export function toCardanoTxOut(qout: QuickblueTxOut): FullTxOut {
  return notImplemented([qout])
}

export type QuickblueMetadata = {
  key: number
  raw: HexString
  json: JSON
}

export type QuickblueTx = {
  blockHash: BlockHash,
  blockIndex: bigint,
  hash: TxHash,
  inputs: [TxIn],
  outputs: [TxOut],
  invalidBefore: bigint,
  invalidHereafter: bigint,
  metadata?: QuickblueMetadata,
}

export function toCardanoTx(qtx: QuickblueTx): Tx {
  return notImplemented([qtx])
}
