import {BaseAddress, EnterpriseAddress} from "@emurgo/cardano-serialization-lib-nodejs"
import {toWasmValue} from "../../interop/serlib"
import {decodeHex, encodeHex} from "../../utils/hex"
import {decimalToFractional} from "../../utils/math"
import {CardanoWasm} from "../../utils/rustLoader"
import {Addr} from "../entities/address"
import {NetworkParams} from "../entities/env"
import {RawUnsignedTx, TxCandidate} from "../entities/tx"

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

    const userAddr = this.toBaseOrEnterpriseAddress(candidate.changeAddr);
    txb.add_required_signer(userAddr.payment_cred().to_keyhash()!);

    if (candidate.collateral) {
      const collateralTxInputsBuilder = this.R.TxInputsBuilder.new();

      for (const i of candidate.collateral) {
        if (i.txOut.value.length > 1) {
          continue;
        }
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
        const refTxInId = this.R.TransactionHash.from_bytes(decodeHex('b2f79375bf73234bb988cfdb911c78ac4e9b5470197e828d507babfdcca08d16'));
        const refTxIn = this.R.TransactionInput.new(refTxInId, 2);

        const plutusWitness = this.R.PlutusWitness.new_with_ref(
          this.R.PlutusScriptSource.new_ref_input(
            this.R.ScriptHash.from_hex(i.consumeScript.validator!),
            refTxIn
          ),
          this.R.DatumSource.new_ref_input(txIn),
          this.R.Redeemer.new(
            this.R.RedeemerTag.new_spend(),
            this.R.BigNum.one(),
            this.R.PlutusData.from_hex(i.consumeScript.redeemer),
            this.R.ExUnits.new(
              this.R.BigNum.from_str("10000000"),
              this.R.BigNum.from_str("9000000000")
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
    txb.calc_script_data_hash(
      this.R.TxBuilderConstants.plutus_vasil_cost_models()
    );

    const txWitness = this.R.TransactionWitnessSet.new()

    const plutusInputScripts = txb.get_plutus_input_scripts()

    if (plutusInputScripts && plutusInputScripts.len()) {
      const plutusList = this.R.PlutusList.new();
      const redeemers = this.R.Redeemers.new();
      const plutusScripts = this.R.PlutusScripts.new();

      for (let i = 0; i < plutusInputScripts.len(); i++) {


        const plutusWitness = plutusInputScripts.get(i);
        const plutusData = plutusWitness.datum();
        const redeemer = plutusWitness.redeemer();
        const plutusScript = plutusWitness.script();

        if (plutusData) {
          plutusList.add(plutusData);
        }
        if (plutusScript) {
          plutusScripts.add(plutusScript)
        }
        redeemers.add(redeemer);
      }
      txWitness.set_plutus_data(plutusList);
      txWitness.set_redeemers(redeemers);
      txWitness.set_plutus_scripts(plutusScripts);

      const costModels = this.R.Costmdls.from_json(JSON.stringify({
        PlutusV1: JSON.stringify((pparams as any).PlutusScriptV1),
        PlutusV2: JSON.stringify((pparams as any).PlutusScriptV2)
      }));
      console.log(
        this.R.hash_script_data(redeemers, costModels, plutusList)
      )
      txb.calc_script_data_hash(costModels);
    }

    const txbody = txb.build()
    const unsignedTx = this.R.Transaction.new(txbody, txWitness)
    return encodeHex(unsignedTx.to_bytes())
  }

  private toBaseOrEnterpriseAddress(addr: Addr): BaseAddress | EnterpriseAddress {
    const address = this.R.Address.from_bech32(addr)

    return this.R.BaseAddress.from_address(address) ?? this.R.EnterpriseAddress.from_address(address)!
  }
}
