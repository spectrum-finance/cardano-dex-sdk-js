import {AssetId} from "../cardano/entities/assetId"
import {AssetEntry} from "../cardano/entities/assetEntry"
import {AdaPolicyId} from "../constants"

/** ADA in Lovelace units or any other asset.
 */
export class AssetAmount {
  constructor(public readonly id: AssetId, public readonly amount: bigint) {}

  withAmount(amount: bigint): AssetAmount {
    return new AssetAmount(this.id, amount)
  }

  get isAda(): boolean {
    return this.id.policyId === AdaPolicyId
  }

  get toEntry(): AssetEntry {
    return {
      ...this.id,
      amount: this.amount
    }
  }
}
