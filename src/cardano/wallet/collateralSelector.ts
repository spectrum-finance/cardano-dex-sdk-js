import {FullTxIn} from "../entities/txIn"

export interface CollateralSelector {
  getCollateral(target: bigint): Promise<FullTxIn[]>;
}
