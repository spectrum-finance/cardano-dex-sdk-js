import {TransactionOutput} from "@emurgo/cardano-serialization-lib-nodejs"
import {AssetAmount} from "../.."
import {toWasmValue} from "../../interop/serlib"
import {decodeHex} from "../../utils/hex"
import {CardanoWasm} from "../../utils/rustLoader"
import {ProtocolParams} from "../entities/env"
import {TxOutCandidate} from "../entities/txOut"
import {Value} from "../entities/value"

const INSUFFICIENT_BYTES = 2;

export interface TxMath {
  minUtxoValue(preValue: Value, hasDatum: boolean): bigint

  minAdaRequiredforOutput(output: TxOutCandidate): bigint

  maxByAssetAndAdaBudget(assetBudget: AssetAmount, adaBudget: bigint, addr: string): AssetAmount;
}

export function mkTxMath(params: ProtocolParams, R: CardanoWasm): TxMath {
  return new CardanoTransactionMath(params, R)
}

class CardanoTransactionMath implements TxMath {
  constructor(public readonly params: ProtocolParams, public readonly R: CardanoWasm) {}

  minUtxoValue(preValue: Value, hasDatum: boolean): bigint {
    const value = toWasmValue(preValue, this.R)
    const utxoCost = this.R.BigNum.from_str(this.params.utxoCostPerWord.toString())
    return BigInt(this.R.min_ada_required(value, hasDatum, utxoCost).to_str())
  }

  minAdaRequiredforOutput(outCandidate: TxOutCandidate): bigint {
    const out = this.toTransactionOutput(outCandidate);
    const dataCost = this.R.DataCost.new_coins_per_byte(this.R.BigNum.from_str(this.params.coinsPerUtxoByte.toString()));

    /** TODO: Investigate insufficient byte for min utxo calculation issue. Compare utxo sizes between cardano bots and frontend sdk.
     * Looks like cardano ser lib issue
    */
    return BigInt(this.R.min_ada_for_output(out, dataCost).to_str()) + BigInt(Number(this.params.coinsPerUtxoByte) * INSUFFICIENT_BYTES);
  }

  maxByAssetAndAdaBudget(assetBudget: AssetAmount, adaBudget: bigint, addr: string): AssetAmount {
    const maxOutputSize = Number(adaBudget) / Number(this.params.coinsPerUtxoByte);
    const estimatedOutput =  this.toTransactionOutput({
      value: Value(0n, assetBudget),
      addr
    });


    console.log(maxOutputSize, assetBudget, estimatedOutput, estimatedOutput.to_bytes().length);

    return assetBudget;
  }

  private toTransactionOutput(o: TxOutCandidate): TransactionOutput {
    const addr = this.R.Address.from_bech32(o.addr)
    const value = toWasmValue(o.value, this.R)
    const out = this.R.TransactionOutput.new(addr, value)
    if (o.data) {
      const pd = this.R.PlutusData.from_bytes(decodeHex(o.data))
      out.set_plutus_data(pd)
    }
    console.log(out);
    return out
  }
}
