import {FullTxOut} from "../../cardano/entities/txOut"
import {AmmPool} from "../domain/ammPool"

export interface PoolsParser {
  parse(box: FullTxOut): AmmPool | undefined

  parseBatch(boxes: FullTxOut[]): AmmPool[]
}

// class DefaultPoolsParser implements PoolsParser {
//
//   parse(box: FullTxOut): AmmPool | undefined {
//     const poolNft = assetAmountOf(box.value, )
//   }
//
//   parseBatch(boxes: FullTxOut[]): AmmPool[] {
//   }
// }
