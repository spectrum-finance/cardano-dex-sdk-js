import {FullTxIn} from "../entities/txIn"
import {Value} from "../entities/value"

export interface InputSelector {
  /** Get inputs satisfying the specified target amount..
   */
  select(target: Value): Promise<FullTxIn[] | Error>;
}
