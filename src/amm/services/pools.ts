import {AssetRef, mkAssetRef} from "../../cardano/types.ts"
import {CardanoNetwork} from "../../quickblue/cardanoNetwork.ts"
import {UtxoSearch} from "../../quickblue/models.ts"
import {Paging} from "../../quickblue/types.ts"
import {AmmPool} from "../domain/ammPool.ts"
import {PoolId} from "../domain/types.ts"
import {PoolsParser} from "../parsers/poolsParser.ts"
import {ScriptCreds} from "../scripts.ts"

export interface Pools {
  /** Get a pool by the given pool `id`.
   */
  get(id: PoolId): Promise<AmmPool | undefined>

  /** Get all pools from the network.
   */
  getAll(paging: Paging): Promise<[AmmPool[], number]>

  /** Get pools containing all of given tokens from the network.
   */
  getByTokens(tokens: AssetRef[], paging: Paging): Promise<[AmmPool[], number]>

  /** Get pools containing any of the given tokens from the network.
   */
  getByTokensUnion(tokens: AssetRef[], paging: Paging): Promise<[AmmPool[], number]>
}

export function mkNetworkPoolsV1(network: CardanoNetwork, parser: PoolsParser, scripts: ScriptCreds): Pools {
  return new NetworkPoolsV1(network, parser, scripts)
}

class NetworkPoolsV1 implements Pools {
  constructor(
    public readonly network: CardanoNetwork,
    public readonly parser: PoolsParser,
    public readonly scripts: ScriptCreds
  ) {}

  async get(id: PoolId): Promise<AmmPool | undefined> {
    const [boxes] = await this.network.getUtxosByAsset(mkAssetRef(id), {offset: 0, limit: 1}, "desc")
    if (boxes.length > 0) {
      const poolBox = boxes[0]
      return this.parser.parse(poolBox)
    }
    return undefined
  }

  async getAll(paging: Paging): Promise<[AmmPool[], number]> {
    const [boxes, totalBoxes] = await this.network.getUtxosByPaymentCred(this.scripts.ammPool, paging)
    const pools = this.parser.parseBatch(boxes)
    const invalid = boxes.length - pools.length
    const total = totalBoxes - invalid
    return [pools, total]
  }

  async getByTokens(tokens: AssetRef[], paging: Paging): Promise<[AmmPool[], number]> {
    const req: UtxoSearch = {paymentCred: this.scripts.ammPool, containsAllOf: tokens}
    return this.searchPools(req, paging)
  }

  async getByTokensUnion(tokens: AssetRef[], paging: Paging): Promise<[AmmPool[], number]> {
    const req: UtxoSearch = {paymentCred: this.scripts.ammPool, containsAnyOf: tokens}
    return this.searchPools(req, paging)
  }

  private async searchPools(req: UtxoSearch, paging: Paging): Promise<[AmmPool[], number]> {
    const [boxes, totalBoxes] = await this.network.searchUtxos(req, paging)
    const pools = this.parser.parseBatch(boxes)
    const invalid = boxes.length - pools.length
    const total = totalBoxes - invalid
    return [pools, total]
  }
}
