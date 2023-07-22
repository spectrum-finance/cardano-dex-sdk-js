import {AdaPolicyId} from "../cardano/constants"
import {AssetClass} from "../cardano/entities/assetClass"
import {AssetEntry} from "../cardano/entities/assetEntry"

/** ADA in Lovelace units or any other asset.
 */
export class AssetAmount {
  constructor(public readonly asset: AssetClass, public readonly amount: bigint) {}

  withAmount(amount: bigint): AssetAmount {
    return new AssetAmount(this.asset, amount)
  }

  add(x: bigint): AssetAmount {
    return new AssetAmount(this.asset, this.amount + x)
  }

  get isAda(): boolean {
    return this.asset.policyId === AdaPolicyId
  }

  get toEntry(): AssetEntry {
    return {
      ...this.asset,
      quantity: this.amount
    }
  }

  static fromEntry(entry: AssetEntry): AssetAmount {
    return new AssetAmount({policyId: entry.policyId, name: entry.name, nameHex: entry.nameHex}, entry.quantity)
  }
}
