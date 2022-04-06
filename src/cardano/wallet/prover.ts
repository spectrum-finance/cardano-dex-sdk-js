import {RawTx, RawUnsignedTx} from "../entities/tx"

export interface Prover {
  sign(tx: RawUnsignedTx): Promise<RawTx>
}
