import {toWasmValue} from "../../interop/serlib"
import {decodeHex, encodeHex} from "../../utils/hex"
import {CardanoWasm} from "../../utils/rustLoader"
import {NetworkParams} from "../entities/env"
import {RawUnsignedTx, TxCandidate} from "../entities/tx"

export interface TxAsm {
  finalize(candidate: TxCandidate): RawUnsignedTx
}

export function mkTxAsm(env: NetworkParams, R: CardanoWasm): TxAsm {
  return new DefaultTxAsm(env, R)
}

class DefaultTxAsm implements TxAsm {
  constructor(public readonly env: NetworkParams, public readonly R: CardanoWasm) {}

  finalize(candidate: TxCandidate): RawUnsignedTx {
    const pparams = this.env.pparams
    const conf = this.R.TransactionBuilderConfigBuilder
      .new()
      .fee_algo(
        this.R.LinearFee.new(
          this.R.BigNum.from_str(pparams.txFeePerByte.toString()),
          this.R.BigNum.from_str(pparams.txFeeFixed.toString())
        )
      )
      .coins_per_utxo_word(this.R.BigNum.from_str(pparams.utxoCostPerWord.toString()))
      .pool_deposit(this.R.BigNum.from_str(pparams.stakePoolDeposit.toString()))
      .key_deposit(this.R.BigNum.from_str(pparams.stakeAddressDeposit.toString()))
      .max_value_size(pparams.maxValueSize)
      .max_tx_size(pparams.maxTxSize)
    const txb = this.R.TransactionBuilder.new(conf.build())
    for (const i of candidate.inputs) {
      const txInId = this.R.TransactionHash.from_bytes(decodeHex(i.txOut.txHash))
      const txIn = this.R.TransactionInput.new(txInId, i.txOut.index)
      const valueIn = toWasmValue(i.txOut.value, this.R)
      const addr = this.R.BaseAddress.from_address(this.R.Address.from_bech32(i.txOut.addr))
      if (i.consumeScript) {
        const sh = addr!.payment_cred().to_scripthash()!
        txb.add_script_input(sh, txIn, valueIn)
      } else {
        const pkh = addr!.payment_cred().to_keyhash()!
        txb.add_key_input(pkh, txIn, valueIn)
      }
    }
    for (const o of candidate.outputs) {
      const addr = this.R.Address.from_bech32(o.addr)
      const value = toWasmValue(o.value, this.R)
      const out = this.R.TransactionOutput.new(addr, value)
      txb.add_output(out)
    }
    const changeAddr = this.R.Address.from_bech32(candidate.changeAddr)
    txb.add_change_if_needed(changeAddr)
    if (candidate.ttl) txb.set_ttl(candidate.ttl)
    return encodeHex(txb.build().to_bytes())
  }
}
