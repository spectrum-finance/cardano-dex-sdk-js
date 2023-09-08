import {
  BaseAddress, Ed25519KeyHash,
  EnterpriseAddress, MintBuilder, PlutusWitness, Transaction,
  TransactionBuilderConfig, TransactionInput, TransactionOutput, TxInputsBuilder, Value
} from "@emurgo/cardano-serialization-lib-nodejs"
import {MintingAsset} from "../../amm/domain/models"
import {toWasmValue} from "../../interop/serlib"
import {decodeHex} from "../../utils/hex"
import {decimalToFractional} from "../../utils/math"
import {CardanoWasm} from "../../utils/rustLoader"
import {Addr} from "../entities/address"
import {NetworkParams, ProtocolParams} from "../entities/env"
import {TxCandidate} from "../entities/tx"
import {FullTxIn} from "../entities/txIn"
import {TxOutCandidate} from "../entities/txOut"

export interface TxAsm {
  finalize(candidate: TxCandidate, coefficient?: number): Transaction
}

export function mkTxAsm(env: NetworkParams, R: CardanoWasm): TxAsm {
  return new DefaultTxAsm(env, R)
}

class DefaultTxAsm implements TxAsm {
  constructor(public readonly env: NetworkParams, public readonly R: CardanoWasm) {
  }

  finalize(candidate: TxCandidate, coefficient?: number): Transaction {
    const txBuilder = this.R.TransactionBuilder.new(this.getTxBuilderConfig(this.env.pparams, coefficient))

    const userAddressKeyHash =  this.toKeyHash(candidate.changeAddr);
    if (userAddressKeyHash) {
      txBuilder.add_required_signer(userAddressKeyHash)
    }

    const additionalSigner =  candidate.requiredSigner ?
      this.R.Ed25519KeyHash.from_hex(candidate.requiredSigner) :
      undefined;
    if (additionalSigner && additionalSigner.to_hex() !== userAddressKeyHash?.to_hex()) {
      txBuilder.add_required_signer(additionalSigner);
    }

    if (candidate.collateral?.length) {
      txBuilder.set_collateral(this.getCollateralBuilder(candidate.collateral))
    }
    if (candidate.mintingScripts?.length) {
      txBuilder.set_mint_builder(this.getMintBuilder(candidate.mintingScripts))
    }

    for (const i of candidate.inputs) {
      if (i.consumeScript) {
        txBuilder.add_plutus_script_input(...this.toPlutusScriptInputData(i))
      } else {
        txBuilder.add_key_input(...this.toKeyInputData(i))
      }
    }

    for (const o of candidate.outputs) {
      txBuilder.add_output(this.toTransactionOutput(o))
    }

    const changeAddr = this.R.Address.from_bech32(candidate.changeAddr)
    txBuilder.add_change_if_needed(changeAddr)

    if (candidate.ttl) txBuilder.set_ttl(candidate.ttl)

    txBuilder.calc_script_data_hash(this.R.TxBuilderConstants.plutus_vasil_cost_models())

    return txBuilder.build_tx()
  }

  private toTransactionOutput(o: TxOutCandidate): TransactionOutput {
    const addr = this.R.Address.from_bech32(o.addr)
    const value = toWasmValue(o.value, this.R)
    const out = this.R.TransactionOutput.new(addr, value)
    if (o.data) {
      const pd = this.R.PlutusData.from_bytes(decodeHex(o.data))
      out.set_plutus_data(pd)
    }
    return out
  }

  private toKeyInputData(i: FullTxIn): [Ed25519KeyHash, TransactionInput, Value] {
    const txInId = this.R.TransactionHash.from_bytes(decodeHex(i.txOut.txHash))
    const txIn = this.R.TransactionInput.new(txInId, i.txOut.index)
    const valueIn = toWasmValue(i.txOut.value, this.R)
    const pkh = this.toKeyHash(i.txOut.addr)!

    return [pkh, txIn, valueIn]
  }

  private toPlutusScriptInputData(i: FullTxIn): [PlutusWitness, TransactionInput, Value] {
    const txInId = this.R.TransactionHash.from_bytes(decodeHex(i.txOut.txHash))
    const txIn = this.R.TransactionInput.new(txInId, i.txOut.index)
    const valueIn = toWasmValue(i.txOut.value, this.R)
    const consumeScript = i.consumeScript!

    const refTxInId = this.R.TransactionHash.from_bytes(decodeHex(consumeScript.opInRef.opInRefHash))
    const refTxIn = this.R.TransactionInput.new(refTxInId, consumeScript.opInRef.opInRefIndex)

    const plutusWitness = this.R.PlutusWitness.new_with_ref(
      this.R.PlutusScriptSource.new_ref_input_with_lang_ver(
        this.R.ScriptHash.from_hex(consumeScript.validator),
        refTxIn,
        this.R.Language.new_plutus_v2()
      ),
      this.R.DatumSource.new_ref_input(txIn),
      this.R.Redeemer.new(
        this.R.RedeemerTag.new_spend(),
        this.R.BigNum.one(),
        this.R.PlutusData.from_hex(consumeScript.redeemer),
        this.R.ExUnits.new(
          this.R.BigNum.from_str(consumeScript.mem),
          this.R.BigNum.from_str(consumeScript.steps)
        )
      )
    )

    return [plutusWitness, txIn, valueIn]
  }

  private getTxBuilderConfig(pparams: ProtocolParams, coefficient?: number): TransactionBuilderConfig {
    const [mem_price_num, mem_price_denom] = decimalToFractional(pparams.executionUnitPrices.priceMemory)
    const [step_price_num, step_price_denom] = decimalToFractional(pparams.executionUnitPrices.priceSteps)

    return this.R.TransactionBuilderConfigBuilder.new()
      .fee_algo(
        this.R.LinearFee.new(
          this.R.BigNum.from_str(coefficient ?
            (Number(pparams.txFeePerByte) * coefficient).toString() :
            pparams.txFeePerByte.toString()
          ),
          this.R.BigNum.from_str(pparams.txFeeFixed.toString())
        )
      )
      .ex_unit_prices(this.R.ExUnitPrices.new(
        this.R.UnitInterval.new(
          this.R.BigNum.from_str(mem_price_num.toString()),
          this.R.BigNum.from_str(mem_price_denom.toString())
        ),
        this.R.UnitInterval.new(
          this.R.BigNum.from_str(step_price_num.toString()),
          this.R.BigNum.from_str(step_price_denom.toString())
        )
      ))
      .coins_per_utxo_word(this.R.BigNum.from_str(pparams.utxoCostPerWord.toString()))
      .pool_deposit(this.R.BigNum.from_str(pparams.stakePoolDeposit.toString()))
      .key_deposit(this.R.BigNum.from_str(pparams.stakeAddressDeposit.toString()))
      .max_value_size(pparams.maxValueSize)
      .max_tx_size(pparams.maxTxSize)
      .prefer_pure_change(true)
      .build()
  }

  private toBaseOrEnterpriseAddress(addr: Addr): BaseAddress | EnterpriseAddress {
    const address = this.R.Address.from_bech32(addr)

    return this.R.BaseAddress.from_address(address) ?? this.R.EnterpriseAddress.from_address(address)!
  }

  private toKeyHash(addr: Addr): Ed25519KeyHash | undefined {
    return this.toBaseOrEnterpriseAddress(addr).payment_cred().to_keyhash()
  }

  private getMintBuilder(mintScripts: MintingAsset[]): MintBuilder {
    const mintBuilder = this.R.MintBuilder.new();

    for (const [i, data] of mintScripts.entries()) {
      const plutusScriptSource = this.R.PlutusScriptSource.new(this.R.PlutusScript.new_v2(decodeHex(data.script)));
      const redeemer = this.R.Redeemer.new(
        this.R.RedeemerTag.new_mint(),
        this.R.BigNum.from_str(i.toString()),
        this.R.PlutusData.new_list(this.R.PlutusList.new()),
        this.R.ExUnits.new(
          this.R.BigNum.from_str(data.exUnits.mem),
          this.R.BigNum.from_str(data.exUnits.steps)
        )
      )
      const mintWitness = this.R.MintWitness.new_plutus_script(plutusScriptSource, redeemer);
      const assetName = this.R.AssetName.from_hex(data.amount.asset.nameHex);
      const amount = this.R.Int.from_str(data.amount.amount.toString());

      mintBuilder.add_asset(mintWitness, assetName, amount);
    }

    return mintBuilder;
  }

  private getCollateralBuilder(collateral: FullTxIn[]): TxInputsBuilder {
    const collateralTxInputsBuilder = this.R.TxInputsBuilder.new()

    for (const i of collateral) {
      const txInId = this.R.TransactionHash.from_bytes(decodeHex(i.txOut.txHash))
      const txIn = this.R.TransactionInput.new(txInId, i.txOut.index)
      const valueIn = toWasmValue(i.txOut.value, this.R)
      const pkh = this.toKeyHash(i.txOut.addr)

      if (pkh) {
        collateralTxInputsBuilder.add_key_input(pkh, txIn, valueIn)
      }
    }

    return collateralTxInputsBuilder
  }
}
