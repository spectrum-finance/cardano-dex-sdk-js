import {AssetRef} from "../../cardano/types"
import {CardanoNetwork} from "../../quickblue/cardanoNetwork"
import {Paging} from "../../quickblue/types"
import {notImplemented} from "../../utils/notImplemented"
import {AmmPool} from "../domain/ammPool"
import {PoolId} from "../domain/types"
import {PoolsParser} from "../parsers/poolsParser"
import {ScriptCreds} from "../scripts"

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

export function mkNetworkPoolsV1(
  network: CardanoNetwork,
  parser: PoolsParser,
  scripts: ScriptCreds
): Pools {
  return new NetworkPoolsV1(network, parser, scripts)
}

class NetworkPoolsV1 implements Pools {
  constructor(
    public readonly network: CardanoNetwork,
    public readonly parser: PoolsParser,
    public readonly scripts: ScriptCreds
  ) {
  }

  get(id: PoolId): Promise<AmmPool | undefined> {
    return notImplemented([id])
  }

  async getAll(paging: Paging): Promise<[AmmPool[], number]> {
    const [boxes, totalBoxes] = await this.network.getUtxosByPaymentCred(this.scripts.ammPoolV1, paging)
    const pools = this.parser.parseBatch(boxes)
    const invalid = boxes.length - pools.length
    const total = totalBoxes - invalid
    return [pools, total]
  }

  getByTokens(tokens: AssetRef[], paging: Paging): Promise<[AmmPool[], number]> {
    return notImplemented([tokens, paging])
  }

  getByTokensUnion(tokens: AssetRef[], paging: Paging): Promise<[AmmPool[], number]> {
    return notImplemented([tokens, paging])
  }
}
