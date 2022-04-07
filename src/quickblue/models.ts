import {Tx} from "../cardano/entities/tx"
import {TxIn} from "../cardano/entities/txIn"
import {FullTxOut} from "../cardano/entities/txOut"
import {Value} from "../cardano/entities/value"
import {
  Addr,
  AssetRef,
  BlockHash,
  Hash28,
  Hash32,
  HexString,
  Lovelace,
  PaymentCred,
  TxHash
} from "../cardano/types"

export type Items<T> = {
  items: T[]
  total: number
}

export type QuickblueTxOut = {
  txHash: TxHash
  index: number
  value: Value
  addr: Addr
  dataHash?: Hash32
  dataBin?: HexString
}

function fixValue(value: Value): Value {
  return value.map(e => ({...e, quantity: BigInt(e.quantity)}))
}

export function toCardanoTxOut(qout: QuickblueTxOut): FullTxOut {
  return {
    txHash: qout.txHash,
    index: qout.index,
    value: fixValue(qout.value),
    addr: qout.addr,
    dataHash: qout.dataHash,
    data: qout.dataBin
  }
}

export type QuickblueRedeemer = {
  unitMem: bigint
  unitSteps: bigint
  fee: Lovelace
  purpose: string
  index: number
  scriptHash: Hash28
}

export type QuickblueTxIn = {
  out: QuickblueTxOut
  redeemer?: QuickblueRedeemer
}

export function toCardanoTxIn(qin: QuickblueTxIn): TxIn {
  return {outTxHash: qin.out.txHash, outIndex: qin.out.index}
}

export type QuickblueMetadata = {
  key: number
  raw: HexString
  json: JSON
}

export type QuickblueTx = {
  blockHash: BlockHash
  blockIndex: bigint
  hash: TxHash
  inputs: [QuickblueTxIn]
  outputs: [QuickblueTxOut]
  invalidBefore: bigint
  invalidHereafter: bigint
  metadata?: QuickblueMetadata
}

export function toCardanoTx(qtx: QuickblueTx): Tx {
  return {
    hash: qtx.hash,
    inputs: qtx.inputs.map(i => toCardanoTxIn(i)),
    outputs: qtx.outputs.map(o => toCardanoTxOut(o)),
    validityRange: [qtx.invalidBefore, qtx.invalidHereafter]
  }
}

export type UtxoSearch = {
  paymentCred: PaymentCred
  containsAllOf?: AssetRef[]
  containsAnyOf?: AssetRef[]
}
