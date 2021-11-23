import {AssetInfo} from "../cardano/entities/AssetInfo"
import {FullOutput} from "../cardano/entities/output"
import {Tx} from "../cardano/entities/tx"
import {AssetRef, OutputRef, PaymentCred, TxHash} from "../cardano/types"
import {Paging, Sorting} from "./types"

export interface CardanoNetwork {
  /** Get transaction by hash.
   */
  getTx(hash: TxHash): Promise<Tx | undefined>

  /** Get output by output reference.
   */
  getOutput(ref: OutputRef): Promise<FullOutput | undefined>

  /** Get unspent outputs by payment credential.
   */
  getUtxosByPaymentCred(pcred: PaymentCred, paging: Paging): Promise<[FullOutput[], number]>

  /** Get transactions related to a given payment credential.
   */
  getTxsByPaymentCred(pcred: PaymentCred, paging: Paging): Promise<[Tx[], number]>

  /**  Get unspent outputs by asset reference.
   */
  getUtxosByAsset(ref: AssetRef, paging: Paging, sort?: Sorting): Promise<FullOutput[]>

  /**  Get asset info by asset reference.
   */
  getAssetInfo(ref: AssetRef): Promise<AssetInfo | undefined>
}
