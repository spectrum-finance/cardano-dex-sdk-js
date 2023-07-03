import {FullTxIn} from "../entities/txIn"
import {Value} from "../entities/value"
import {TxHash} from "../types";

export interface InputSelector {
  /** Get inputs satisfying the specified target amount..
   */
  select(target: Value, excludedInputs?: FullTxIn[]): Promise<FullTxIn[] | Error>;

  selectById(txHash: TxHash, index: number): Promise<FullTxIn[] | Error>;
}
