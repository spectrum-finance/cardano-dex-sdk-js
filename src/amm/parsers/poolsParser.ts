import {FullTxOut} from "../../cardano/entities/txOut.js"
import {assetAmountOf} from "../../cardano/entities/value.js"
import {CardanoWasm} from "../../utils/rustLoader.js"
import {parsePoolConfig} from "../contractData.js"
import {AmmPool} from "../domain/ammPool.js"

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
    if (box.dataBin) {
      const poolConfig = parsePoolConfig(box.dataBin, this.R)
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
    const pools: AmmPool[] = []
    for (const box of boxes) {
      const pool = this.parse(box)
      if (pool) pools.push(pool)
    }
    return pools
  }
}
