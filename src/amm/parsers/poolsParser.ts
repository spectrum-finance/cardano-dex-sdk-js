import {FullTxOut} from "../../cardano/entities/txOut"
import {assetAmountOf} from "../../cardano/entities/value"
import {CardanoWasm} from "../../utils/rustLoader"
import {parsePoolDatum} from "../contractData"
import {AmmPool} from "../domain/ammPool"

export interface PoolsParser {
  parse(box: FullTxOut): AmmPool | undefined

  parseBatch(boxes: FullTxOut[]): AmmPool[]
}

export function mkPoolsParser(R: CardanoWasm): PoolsParser {
  return new DefaultPoolsParser(R)
}

class DefaultPoolsParser implements PoolsParser {
  constructor(public readonly R: CardanoWasm) {}

  parse(box: FullTxOut): AmmPool | undefined {
    if (box.data) {
      const poolConfig = parsePoolDatum(box.data, this.R)
      if (poolConfig) {
        const nft = assetAmountOf(box.value, poolConfig.nft)
        const x = assetAmountOf(box.value, poolConfig.x)
        const y = assetAmountOf(box.value, poolConfig.y)
        const lq = assetAmountOf(box.value, poolConfig.lq)
        return new AmmPool(nft.asset, lq, x, y, poolConfig.feeNum)
      }
    }
    return undefined
  }

  parseBatch(boxes: FullTxOut[]): AmmPool[] {
    const pools = []
    for (const box of boxes) {
      const pool = this.parse(box)
      if (pool) pools.push(pool)
    }
    return pools
  }
}
