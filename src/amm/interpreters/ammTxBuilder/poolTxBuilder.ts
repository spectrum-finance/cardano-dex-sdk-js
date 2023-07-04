import {TxCandidate} from "../../../cardano/entities/tx";
import {PoolCreationParams} from "../../math/pool";
import {add, getLovelace, remove, sum, Value} from "../../../cardano/entities/value";
import {AdaEntry} from "../../../cardano/entities/assetEntry";
import {getChangeOrderValue} from "../../../utils/getChangeOrderValue";
import {OrderKind} from "../../models/opRequests";
import {TxMath} from "../../../cardano/wallet/txMath";
import {AmmOutputs} from "../ammOutputs";
import {AmmActions} from "../ammActions";
import {InputSelector} from "../../../cardano/wallet/inputSelector";

export interface PoolCreationTxInfo {

}

export class PoolCreationBuilder {

  constructor(
    private txMath: TxMath,
    private ammOutputs: AmmOutputs,
    private ammActions: AmmActions,
    private inputSelector: InputSelector
  ) {
  }

  async build(params: PoolCreationParams): Promise<[TxCandidate, PoolCreationTxInfo]> {
    const totalOrderBudget = this.getPoolBudget(params);

    let inputs = await this.inputSelector.select(totalOrderBudget)
    let inputForMinting = await this.inputSelector.selectById(params.mintingCreationTxHash, params.mintingCreationTxOutIdx)

    if (inputs instanceof Error) {
      throw new Error("insufficient funds")
    }

    if (inputForMinting instanceof Error) {
      throw new Error("Missing input for minting")
    }

    const estimatedChange = remove(
      sum(inputs.map(input => input.txOut.value)),
      totalOrderBudget
    );

    const [, additionalAdaForChange] = getChangeOrderValue(estimatedChange, params.userAddress, this.txMath);

    if (additionalAdaForChange) {
      const additionalInput = await this.inputSelector.select([AdaEntry(additionalAdaForChange)], inputs);

      if (additionalInput instanceof Error) {
        throw new Error("insufficient funds")
      }
      inputs = inputs.concat(additionalInput);
    }

    const txInfo: PoolCreationTxInfo = {}

    return [
      this.ammActions.createOrder(
        {
          kind: OrderKind.PoolCreation,
          x: params.x,
          y: params.y,
          lq: params.lq,
          lqMintingScript: params.lqMintingScript,
          nft: params.nft,
          nftMintingScript: params.nftMintingScript,
          feeNum: params.feeNum,
          uiFee: params.uiFee,
          poolValue: params.value,
          mintingCreationTxHash: params.mintingCreationTxHash,
          mintingCreationTxOutIdx: params.mintingCreationTxOutIdx,
          userAddress: params.userAddress
        },
        {
          changeAddr: params.userAddress,
          collateralInputs: [],
          inputs: inputs.concat(inputForMinting)
        }
      ),
      txInfo
    ]
  }

  private getPoolBudget(
    params: PoolCreationParams
  ): Value {
    const [poolOutputPreUpdated, userLqOutput] = this.ammOutputs.poolCreation({
      kind: OrderKind.PoolCreation,
      x: params.x.withAmount(BigInt("0x7fffffffffffffff")),
      y: params.y.withAmount(BigInt("0x7fffffffffffffff")),
      lq: params.lq.withAmount(BigInt("0x7fffffffffffffff")),
      lqMintingScript: params.lqMintingScript,
      nft: params.nft.withAmount(BigInt("0x7fffffffffffffff")),
      nftMintingScript: params.nftMintingScript,
      feeNum: params.feeNum,
      uiFee: params.uiFee,
      poolValue: params.value,
      mintingCreationTxHash: params.mintingCreationTxHash,
      mintingCreationTxOutIdx: params.mintingCreationTxOutIdx,
      userAddress: params.userAddress
    })
    const updatedPoolOutput = {
      value: add(poolOutputPreUpdated.value, params.lq.withAmount(BigInt("0x7fffffffffffffff")).toEntry),
      addr: poolOutputPreUpdated.addr,
      data: poolOutputPreUpdated.data
    }
    const requiredAdaForPoolOutput = this.txMath.minAdaRequiredforOutput(updatedPoolOutput);
    const requiredAdaForUserLqOutput = this.txMath.minAdaRequiredforOutput(userLqOutput);
    const requiredAdaForOutputs = requiredAdaForPoolOutput + requiredAdaForUserLqOutput
    const lovelace = getLovelace(params.value)

    return lovelace.amount >= requiredAdaForOutputs
      ? params.value
      : add(params.value, AdaEntry(requiredAdaForOutputs - lovelace.amount))
  }
}
