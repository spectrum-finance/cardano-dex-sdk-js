import {AssetRef} from "../../cardano/types"
import {Paging} from "../../quickblue/types"
import {AmmPool} from "../domain/ammPool"
import {PoolId} from "../domain/types"

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
