import {AssetName} from "../cardano/types"

/** ADA in Lovelace units or any other asset.
  */
export class AssetAmount {
  constructor(public readonly name: AssetName, public readonly amount: bigint) {}

  withAmount(amount: bigint): AssetAmount {
    return new AssetAmount(this.name, amount)
  }
}
