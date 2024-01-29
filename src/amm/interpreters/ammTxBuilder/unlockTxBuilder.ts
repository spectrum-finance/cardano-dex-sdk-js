import {Addr, extractPaymentCred} from "../../../cardano/entities/address"
import {ProtocolParams} from "../../../cardano/entities/env"
import {TxCandidate} from "../../../cardano/entities/tx"
import {FullTxIn} from "../../../cardano/entities/txIn"
import {HexString} from "../../../cardano/types"
import {CollateralSelector} from "../../../cardano/wallet/collateralSelector"
import {CardanoNetwork} from "../../../quickblue/cardanoNetwork"
import {CardanoWasm} from "../../../utils/rustLoader"
import {AmmTxFeeMapping} from "../../math/order"
import {OpInRefsMainnetV1, OrderAddrs, ScriptCreds} from "../../scripts"

export interface UnlockParams {
  readonly changeAddress: Addr;
  readonly txFees: AmmTxFeeMapping;
  readonly boxId: HexString;
  readonly redeemer: HexString;
  readonly collateralAmount: bigint;
}

export interface UnlockTxInfo {
  readonly txFee: bigint | undefined;
}

export class UnlockTxBuilder {
  constructor(
    private collateralSelector: CollateralSelector,
    private pparams: ProtocolParams,
    private network: CardanoNetwork,
    private addrs: OrderAddrs,
    private scripts: ScriptCreds,
    private R: CardanoWasm
  ) {
  }

  async build(params: UnlockParams, userTxFee?: bigint): Promise<[TxCandidate, UnlockTxInfo, Error | undefined]> {
    const collateral = await this
      .collateralSelector
      .getCollateral(params.collateralAmount)
    if (!collateral) {
      return Promise.reject([null as any, {txFee: undefined}, new Error(`User has no collateral inputs`)])
    }
    if (collateral.length > this.pparams.maxCollateralInputs) {
      return Promise.reject([null as any, {txFee: undefined}, new Error(`Too many collateral inputs`)])
    }

    const [txId, boxIndex] = params.boxId.split("#")

    if (!txId || boxIndex === null || boxIndex === undefined) {
      return Promise.resolve([null as any, {txFee: undefined}, new Error(`lock for ${params.boxId} not found`)])
    }

    const tx = await this.network.getTx(txId)
    if (!tx) {
      return Promise.resolve([null as any, {txFee: undefined}, new Error(`lock for ${params.boxId} not found`)])
    }

    const boxToUnlock = tx.outputs[Number(boxIndex)]
    if (!boxToUnlock) {
      return Promise.resolve([null as any, {txFee: undefined}, new Error(`lock for ${params.boxId} not found`)])
    }
    if (boxToUnlock.addr !== this.addrs.ammLock) {
      return Promise.resolve([null as any, {txFee: undefined}, new Error(`lock for ${params.boxId} not valid`)])
    }

    const inputs: FullTxIn[] = [{
      txOut:         boxToUnlock,
      consumeScript: {
        opInRef:   OpInRefsMainnetV1.ammLock,
        datum:     boxToUnlock.dataBin,
        validator: this.scripts.ammLock,
        redeemer:  this.R.PlutusData.new_integer(this.R.BigInt.from_str("0")).to_hex(),
        mem:       "140000",
        steps:     "60000000"
      }
    }]
    const rewardPKH = params.redeemer
    let rewardAddress: string

    if (rewardPKH === extractPaymentCred(params.changeAddress, this.R)) {
      rewardAddress = params.changeAddress
    } else {
      const stakeCredential = this.R.BaseAddress.from_address(this.R.Address.from_bech32(boxToUnlock.addr))?.stake_cred()
      const paymentCredential = this.R.StakeCredential
        .from_keyhash(this.R.Ed25519KeyHash.from_hex(params.redeemer))

      const addr = stakeCredential ?
        this.R.BaseAddress.new(this.R.NetworkIdKind.Mainnet, paymentCredential, stakeCredential) :
        this.R.EnterpriseAddress.new(this.R.NetworkIdKind.Mainnet, paymentCredential)

      rewardAddress = addr.to_address().to_bech32()
    }

    return [
      {
        inputs,
        outputs:        [{
          value: boxToUnlock.value,
          addr:  rewardAddress
        }],
        changeAddr:     rewardAddress,
        collateral:     collateral,
        requiredSigner: rewardPKH
      },
      {
        txFee: userTxFee || params.txFees.lockOrder
      },
      undefined
    ]
  }
}