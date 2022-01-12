import {AdaPolicyId} from "../cardano/constants"
import {AssetEntry} from "../cardano/entities/assetEntry"
import {AssetClass} from "../cardano/entities/assetClass"

/** ADA in Lovelace units or any other asset.
 */
export class AssetAmount {
  constructor(public readonly id: AssetClass, public readonly amount: bigint) {}

  withAmount(amount: bigint): AssetAmount {
    return new AssetAmount(this.id, amount)
  }

  get isAda(): boolean {
    return this.id.policyId === AdaPolicyId
  }

  get toEntry(): AssetEntry {
    return {
      ...this.id,
      quantity: this.amount
    }
  }
}
