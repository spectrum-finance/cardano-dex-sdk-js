import {FullTxIn} from "../entities/txIn"
import {Value} from "../entities/value"
import {TxHash} from "../types"

export interface InputSelector {
  /** Get inputs satisfying the specified target amount..
   */
  select(inputs: FullTxIn[], target: Value, excludedInputs?: FullTxIn[]): FullTxIn[] | Error;

  selectById(inputs: FullTxIn[], txHash: TxHash, index: number): FullTxIn[] | Error;
}

export interface InputCollector {
  getInputs(): Promise<FullTxIn[]>;
}
