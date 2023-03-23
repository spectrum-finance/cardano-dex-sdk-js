import {BaseAddress, EnterpriseAddress} from "@emurgo/cardano-serialization-lib-nodejs"
import {toWasmValue} from "../../interop/serlib"
import {decodeHex, encodeHex} from "../../utils/hex"
import {CardanoWasm} from "../../utils/rustLoader"
import {Addr} from "../entities/address"
import {NetworkParams} from "../entities/env"
import {RawUnsignedTx, TxCandidate} from "../entities/tx"
import {decimalToFractional} from "../../utils/math"

export interface TxAsm {
  finalize(candidate: TxCandidate): RawUnsignedTx
}

export function mkTxAsm(env: NetworkParams, R: CardanoWasm): TxAsm {
  return new DefaultTxAsm(env, R)
}

class DefaultTxAsm implements TxAsm {
  constructor(public readonly env: NetworkParams, public readonly R: CardanoWasm) {
  }

  finalize(candidate: TxCandidate): RawUnsignedTx {
    const pparams = this.env.pparams
    const [mem_price_num, mem_price_denom] = decimalToFractional(pparams.executionUnitPrices.priceMemory)
    const [step_price_num, step_price_denom] = decimalToFractional(pparams.executionUnitPrices.priceSteps)
    const conf = this.R.TransactionBuilderConfigBuilder.new()
      .fee_algo(
        this.R.LinearFee.new(
          this.R.BigNum.from_str(pparams.txFeePerByte.toString()),
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
    const txb = this.R.TransactionBuilder.new(conf)
    const userAddr = this.toBaseOrEnterpriseAddress(candidate.changeAddr)
    txb.add_required_signer(userAddr.payment_cred().to_keyhash()!)

    if (candidate.collateral) {
      const collateralTxInputsBuilder = this.R.TxInputsBuilder.new();

      for (const i of candidate.collateral) {
        const txInId = this.R.TransactionHash.from_bytes(decodeHex(i.txOut.txHash));
        const txIn = this.R.TransactionInput.new(txInId, i.txOut.index);
        const valueIn = toWasmValue(i.txOut.value, this.R);
        const addr = this.toBaseOrEnterpriseAddress(i.txOut.addr);
        const pkh = addr.payment_cred().to_keyhash()!

        collateralTxInputsBuilder.add_key_input(pkh, txIn, valueIn);
      }
      txb.set_collateral(collateralTxInputsBuilder)
    }

    for (const i of candidate.inputs) {
      const txInId = this.R.TransactionHash.from_bytes(decodeHex(i.txOut.txHash))
      const txIn = this.R.TransactionInput.new(txInId, i.txOut.index)
      const valueIn = toWasmValue(i.txOut.value, this.R)
      const addr = this.toBaseOrEnterpriseAddress(i.txOut.addr)

      if (i.consumeScript) {
        const plutusData = this.R.PlutusData.from_hex(i.consumeScript.datum!)
        const plutusWitness = this.R.PlutusWitness.new(
          this.R.PlutusScript.from_hex(i.consumeScript.validator),
          plutusData,
          this.R.Redeemer.new(
            this.R.RedeemerTag.new_spend(),
            this.R.BigNum.zero(),
            plutusData,
            this.R.ExUnits.new(
              this.R.BigNum.from_str("18221176"),
              this.R.BigNum.from_str("61300")
            )
          )
        )
        txb.add_plutus_script_input(plutusWitness, txIn, valueIn)
      } else {
        const pkh = addr.payment_cred().to_keyhash()!
        txb.add_key_input(pkh, txIn, valueIn)
      }
    }
    for (const o of candidate.outputs) {
      const addr = this.R.Address.from_bech32(o.addr)
      const value = toWasmValue(o.value, this.R)
      const out = this.R.TransactionOutput.new(addr, value)
      if (o.data) {
        const pd = this.R.PlutusData.from_bytes(decodeHex(o.data))
        out.set_plutus_data(pd)
      }
      txb.add_output(out)
    }
    const changeAddr = this.R.Address.from_bech32(candidate.changeAddr)
    txb.add_change_if_needed(changeAddr)
    if (candidate.ttl) txb.set_ttl(candidate.ttl)

    const txbody = txb.build()
    const txWitness = this.R.TransactionWitnessSet.new()

    // const plutusInputScripts = txb.get_plutus_input_scripts()
    //
    // if (plutusInputScripts && plutusInputScripts.len()) {
    //   const plutusList = this.R.PlutusList.new();
    //   const redeemers = this.R.Redeemers.new();
    //   const plutusScripts = this.R.PlutusScripts.new();
    //
    //   for (let i = 0; i < plutusInputScripts.len(); i++) {
    //     const plutusWitness = plutusInputScripts.get(i);
    //     const plutusData = plutusWitness.datum();
    //     const redeemer = plutusWitness.redeemer();
    //     const plutusScript = plutusWitness.script();
    //
    //     if (plutusData) {
    //       plutusList.add(plutusData);
    //     }
    //     if (plutusScript) {
    //       plutusScripts.add(plutusScript)
    //     }
    //     redeemers.add(redeemer);
    //   }
    //   txWitness.set_plutus_data(plutusList);
    //   txWitness.set_redeemers(redeemers);
    //   txWitness.set_plutus_scripts(plutusScripts);
    // }
    const unsignedTx = this.R.Transaction.new(txbody, txWitness)
    return encodeHex(unsignedTx.to_bytes())
  }

  private toBaseOrEnterpriseAddress(addr: Addr): BaseAddress | EnterpriseAddress {
    const address = this.R.Address.from_bech32(addr)

    return this.R.BaseAddress.from_address(address) ?? this.R.EnterpriseAddress.from_address(address)!
  }
}
