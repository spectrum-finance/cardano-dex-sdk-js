import {RawUnsignedTx} from "../entities/tx.js"
import {RawTxWitnessSet} from "../entities/witness.js"

export interface Prover {
  sign(tx: RawUnsignedTx, partialSign?: boolean): Promise<RawTxWitnessSet>
}
