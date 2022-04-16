import {RawTx, RawUnsignedTxBody} from "../entities/tx"

export interface Prover {
  sign(tx: RawUnsignedTxBody): Promise<RawTx>
}
