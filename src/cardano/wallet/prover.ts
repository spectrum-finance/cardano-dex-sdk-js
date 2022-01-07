import {RawTx, RawUnsignedTx} from "../entities/rawTx"

export interface Prover {
  sign(tx: RawUnsignedTx): Promise<RawTx>
}
