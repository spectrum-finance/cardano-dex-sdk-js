import {RawUnsignedTx} from "../entities/tx.ts"
import {RawTxWitnessSet} from "../entities/witness.ts"

export interface Prover {
  sign(tx: RawUnsignedTx, partialSign?: boolean): Promise<RawTxWitnessSet>
}
