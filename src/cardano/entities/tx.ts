import {MintingAsset} from "../../amm/domain/models";
import {HexString, TxHash, ValidityRange} from "../types"
import {Addr} from "./address"
import {FullTxIn, TxIn} from "./txIn"
import {TxOut, TxOutCandidate} from "./txOut"

export type Tx = {
  hash: TxHash
  inputs: TxIn[]
  outputs: TxOut[]
  validityRange?: ValidityRange
  collateral?: TxIn[]
}

export type TxCandidate = {
  inputs: FullTxIn[];
  outputs: TxOutCandidate[];
  changeAddr: Addr;
  validityRange?: ValidityRange;
  mintingScripts?: MintingAsset[];
  collateral?: FullTxIn[];
  ttl?: number;
  requiredSigner?: string;
}

export type RawUnsignedTx = HexString

export type RawTx = HexString
