import {Addr} from "../../../cardano/entities/address"
import {PubKeyHash} from "../../../cardano/entities/publicKey"
import {TxCandidate} from "../../../cardano/entities/tx"
import {Value} from "../../../cardano/entities/value"
import {Lovelace} from "../../../cardano/types"
import {InputSelector} from "../../../cardano/wallet/inputSelector"
import {TxMath} from "../../../cardano/wallet/txMath"
import {AssetAmount} from "../../../domain/assetAmount"
import {MetaMintingService} from "../../../mintingMeta/metaMintingService"
import {CardanoWasm} from "../../../utils/rustLoader"
import {AmmTxFeeMapping} from "../../math/order"
import {AmmActions} from "../ammActions"
import {AmmOutputs} from "../ammOutputs"

export interface SetupParams {
  readonly x: AssetAmount;
  readonly y: AssetAmount;
  readonly slippage: number;
  readonly txFees: AmmTxFeeMapping;
  readonly minExecutorReward: Lovelace;
  readonly changeAddress: Addr;
  readonly pk: PubKeyHash;
}

export interface SetupTxInfo {
  readonly txFee: bigint | undefined;
  readonly exFee: bigint;
  readonly refundableDeposit: bigint;
  readonly x: AssetAmount;
  readonly y: AssetAmount;
  readonly orderBudget: Value;
  readonly orderValue: Value;
}

export class SetupAmmTxBuilder {
  constructor(
    private txMath: TxMath,
    private ammOutputs: AmmOutputs,
    private ammActions: AmmActions,
    private inputSelector: InputSelector,
    private mintingService: MetaMintingService,
    private R: CardanoWasm
  ) {}

  async build(params: SetupParams, userTxFee?: bigint): Promise<[TxCandidate, SetupTxInfo]> {

  }
}
