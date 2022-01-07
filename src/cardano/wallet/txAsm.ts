import {RawUnsignedTx} from "../entities/rawTx"
import {TxCandidate} from "../entities/tx"

export interface TxAsm {
  finalize(candidate: TxCandidate): Promise<RawUnsignedTx>
}
