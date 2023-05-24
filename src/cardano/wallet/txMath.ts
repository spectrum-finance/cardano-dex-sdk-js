import {toWasmValue} from "../../interop/serlib.ts"
import {CardanoWasm} from "../../utils/rustLoader.ts"
import {ProtocolParams} from "../entities/env.ts"
import {Value} from "../entities/value.ts"

export interface TxMath {
  minUtxoValue(preValue: Value, hasDatum: boolean): bigint
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
}
