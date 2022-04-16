import {RawUnsignedTx} from "../entities/tx"
import {RawTxWitnessSet} from "../entities/witness"

export interface Prover {
  sign(tx: RawUnsignedTx): Promise<RawTxWitnessSet>
}
