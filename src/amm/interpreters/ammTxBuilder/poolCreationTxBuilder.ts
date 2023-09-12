import {Addr} from "../../../cardano/entities/address"
import {AdaEntry} from "../../../cardano/entities/assetEntry"
import {PubKeyHash} from "../../../cardano/entities/publicKey"
import {TxCandidate} from "../../../cardano/entities/tx"
import {FullTxIn} from "../../../cardano/entities/txIn"
import {add, getLovelace, Value} from "../../../cardano/entities/value"
import {HexString, TxHash} from "../../../cardano/types"
import {InputSelector} from "../../../cardano/wallet/inputSelector"
import {TxMath} from "../../../cardano/wallet/txMath"
import {AssetAmount} from "../../../domain/assetAmount"
import {AmmTxFeeMapping} from "../../math/order"
import {OrderKind} from "../../models/opRequests"
import {AmmActions} from "../ammActions"
import {AmmOutputs} from "../ammOutputs"
import {selectInputs} from "./selectInputs"
import {CollateralSelector} from "../../../cardano/wallet/collateralSelector"

export interface PoolCreationParams {
  readonly x: AssetAmount
  readonly y: AssetAmount
  readonly nft: AssetAmount
  readonly lq: AssetAmount
  readonly feeNum: bigint
  readonly nftMintingScript: HexString
  readonly lqMintingScript: HexString
  readonly mintingCreationTxHash: TxHash
  readonly mintingCreationTxOutIdx: number
  readonly txFees: AmmTxFeeMapping
  readonly changeAddress: Addr
  readonly pk: PubKeyHash
  readonly collateralAmount: bigint;
}

export interface PoolCreationTxInfo {
  readonly txFee: bigint | undefined;
  readonly refundableDeposit: bigint
  readonly poolOutputMinRequiredAda: bigint;
  readonly orderBudget: Value
}

export class PoolCreationTxBuilder {

  constructor(
    private txMath: TxMath,
    private ammOutputs: AmmOutputs,
    private ammActions: AmmActions,
    private inputSelector: InputSelector,
    private collateralSelector: CollateralSelector
  ) {
  }

  async build(params: PoolCreationParams, allInputs: FullTxIn[], userTxFee?: bigint): Promise<[TxCandidate, PoolCreationTxInfo]> {
    const [orderBudget, refundableDeposit, poolOutputMinRequiredAda] = this.getPoolCreationBudget(params)
    const totalOrderBudget = add(orderBudget, AdaEntry(userTxFee || params.txFees.poolCreation))


    const collateralOrError = await this.collateralSelector.getCollateral(params.collateralAmount);
    const inputsOrError = await selectInputs(totalOrderBudget, params.changeAddress, this.inputSelector, allInputs, this.txMath)
    const inputForMinting = await  this
        .inputSelector
        .selectById(allInputs, params.mintingCreationTxHash, params.mintingCreationTxOutIdx)

    if (inputForMinting instanceof Error) {
      throw inputForMinting
    }
    if (collateralOrError instanceof Error) {
      throw collateralOrError;
    }

    const inputs: FullTxIn[] = inputsOrError instanceof Error ? [] : inputsOrError

    const inputsDictionary = inputs
      .concat(inputForMinting)
      .reduce<{[key: string]: FullTxIn}>((acc, input) => {
        const inputId = `${input.txOut.txHash}#${input.txOut.index}`

        if (!acc[inputId]) {
          acc[inputId] = input
        }

        return acc
      }, {})

    const txInfo: PoolCreationTxInfo = {
      txFee:  userTxFee || params.txFees.poolCreation,
      refundableDeposit,
      poolOutputMinRequiredAda,
      orderBudget
    }

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
          uiFee: 0n,
          poolValue: totalOrderBudget,
          mintingCreationTxHash: params.mintingCreationTxHash,
          mintingCreationTxOutIdx: params.mintingCreationTxOutIdx,
          minAdaForUserOutput: refundableDeposit,
          userAddress: params.changeAddress
        },
        {
          changeAddr: params.changeAddress,
          collateralInputs: collateralOrError,
          inputs: Object.values(inputsDictionary)
        }
      ),
      txInfo
    ]
  }

  private getPoolCreationBudget(
    params: PoolCreationParams
  ): [Value, bigint, bigint] {
    const poolValue = Value(0n, [params.x, params.y])
    const [poolOutput, userLqOutput] = this.ammOutputs.poolCreation({
      kind:                    OrderKind.PoolCreation,
      x:                       params.x,
      y:                       params.y,
      lq:                      params.lq,
      nft:                     params.nft,
      feeNum:                  params.feeNum,
      poolValue:               poolValue,
      uiFee:                   0n,
      minAdaForUserOutput:     0n,
      lqMintingScript:         params.lqMintingScript,
      nftMintingScript:        params.nftMintingScript,
      mintingCreationTxHash:   params.mintingCreationTxHash,
      mintingCreationTxOutIdx: params.mintingCreationTxOutIdx,
      userAddress:             params.changeAddress
    })
    const requiredAdaForPoolOutput = this.txMath.minAdaRequiredforOutput(poolOutput)
    const requiredAdaForUserLqOutput = this.txMath.minAdaRequiredforOutput(userLqOutput)
    const lovelace = getLovelace(poolValue)

    console.log(lovelace, requiredAdaForPoolOutput)

    return lovelace.amount >= requiredAdaForPoolOutput ?
      [
        add(poolValue, AdaEntry(requiredAdaForUserLqOutput)),
        requiredAdaForUserLqOutput,
        0n
      ] :
      [
        add(add(poolValue, AdaEntry(requiredAdaForPoolOutput - lovelace.amount)), AdaEntry(requiredAdaForUserLqOutput)),
        requiredAdaForUserLqOutput,
        requiredAdaForPoolOutput - lovelace.amount
      ]
  }
}
