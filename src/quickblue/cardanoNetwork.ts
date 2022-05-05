import axios, {AxiosInstance} from "axios"
import {AssetInfo} from "../cardano/entities/assetInfo"
import {NetworkParams} from "../cardano/entities/env"
import {Tx} from "../cardano/entities/tx"
import {FullTxOut} from "../cardano/entities/txOut"
import {AssetRef, Datum, PaymentCred, TxHash, TxOutRef} from "../cardano/types"
import {JSONBI, JSONBI_ALWAYS} from "../utils/json"
import {
  Items,
  NetworkContext,
  quickblueNetworkParamsTransformer,
  QuickblueTx,
  QuickblueTxOut,
  quickblueTxOutJsonTransformer,
  toCardanoTx,
  toCardanoTxOut,
  UtxoSearch
} from "./models"
import {Ordering, Paging} from "./types"

export interface CardanoNetwork {
  /** Get transaction by hash.
   */
  getTx(hash: TxHash): Promise<Tx | undefined>

  /** Get output by output reference.
   */
  getOutput(ref: TxOutRef): Promise<FullTxOut | undefined>

  /** Get unspent outputs by payment credential.
   */
  getUtxosByPaymentCred(pcred: PaymentCred, paging: Paging): Promise<[FullTxOut[], number]>

  /** Get transactions related to a given payment credential.
   */
  getTxsByPaymentCred(pcred: PaymentCred, paging: Paging): Promise<[QuickblueTx[], number]>

  /**  Get unspent outputs by asset reference.
   */
  getUtxosByAsset(ref: AssetRef, paging: Paging, ordering?: Ordering): Promise<[FullTxOut[], number]>

  /** Search UTxOs.
   */
  searchUtxos(req: UtxoSearch, paging: Paging): Promise<[FullTxOut[], number]>

  /**  Get asset info by asset reference.
   */
  getAssetInfo(ref: AssetRef): Promise<AssetInfo | undefined>

  /** Report datum.
   */
  reportDatum(datum: Datum): Promise<void>

  /** Get network context.
   */
  getNetworkContext(): Promise<NetworkContext>

  /** Get network params.
   */
  getNetworkParams(): Promise<NetworkParams>
}

function fix<A, B>(a: A, fixF: (a: A) => B): A {
  fixF(a)
  return a
}

export class Quickblue implements CardanoNetwork {
  readonly backend: AxiosInstance

  constructor(uri: string) {
    this.backend = axios.create({
      baseURL: uri,
      timeout: 15000,
      headers: {"Content-Type": "application/json"}
    })
  }

  getAssetInfo(ref: AssetRef): Promise<AssetInfo | undefined> {
    return this.backend
      .request<AssetInfo>({
        url: `/assets/info/${ref}`,
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => fix(res.data, ai => (ai.emission = BigInt(ai.emission))))
  }

  getOutput(ref: TxOutRef): Promise<FullTxOut | undefined> {
    return this.backend
      .request<QuickblueTxOut>({
        url: `/outputs/${ref}`,
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => toCardanoTxOut(res.data))
  }

  getTx(hash: TxHash): Promise<Tx | undefined> {
    return this.backend
      .request<QuickblueTx>({
        url: `/transactions/${hash}`,
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => toCardanoTx(res.data))
  }

  getTxsByPaymentCred(pcred: PaymentCred, paging: Paging): Promise<[QuickblueTx[], number]> {
    return this.backend
      .request<Items<QuickblueTx>>({
        url: `/transactions/byPaymentCred/${pcred}`,
        params: paging,
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => [res.data.items, res.data.total])
  }

  getUtxosByAsset(ref: AssetRef, paging: Paging, ordering?: Ordering): Promise<[FullTxOut[], number]> {
    return this.backend
      .request<Items<QuickblueTxOut>>({
        url: `/outputs/unspent/byAsset/${ref}`,
        params: {...paging, ordering},
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => [res.data.items.map(i => toCardanoTxOut(i)), res.data.total])
  }

  searchUtxos(req: UtxoSearch, paging: Paging): Promise<[FullTxOut[], number]> {
    return this.backend
      .post<Items<QuickblueTxOut>>("/outputs/unspent/search", req, {
        params: {...paging},
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => [res.data.items.map(i => toCardanoTxOut(i)), res.data.total])
  }

  getUtxosByPaymentCred(pcred: PaymentCred, paging: Paging): Promise<[FullTxOut[], number]> {
    return this.backend
      .request<Items<QuickblueTxOut>>({
        url: `/outputs/unspent/byPaymentCred/${pcred}`,
        params: paging,
        transformResponse: quickblueTxOutJsonTransformer
      })
      .then(res => [res.data.items.map(i => toCardanoTxOut(i)), res.data.total])
  }

  reportDatum(datum: Datum): Promise<void> {
    return this.backend.post(`/datum/report`, datum, {headers: {"Content-Type": "application/json"}})
  }

  getNetworkContext(): Promise<NetworkContext> {
    return this.backend
      .request<NetworkContext>({
        url: "/blocks/bestBlock",
        transformResponse: data => JSONBI_ALWAYS.parse(data)
      })
      .then(res => res.data)
  }

  getNetworkParams(): Promise<NetworkParams> {
    return this.backend
      .request<NetworkParams>({
        url: "/networkParams",
        transformResponse: quickblueNetworkParamsTransformer
      })
      .then(res => res.data)
  }
}
