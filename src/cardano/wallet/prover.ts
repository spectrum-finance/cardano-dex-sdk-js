import {RawTxWitnessSet, RawUnsignedTx} from "../entities/tx"

export interface Prover {
  sign(tx: RawUnsignedTx): Promise<RawTxWitnessSet>
}
