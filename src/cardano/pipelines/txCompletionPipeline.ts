import {Transaction} from "@emurgo/cardano-serialization-lib-nodejs"
import {CardanoNetwork} from "../../quickblue/cardanoNetwork"
import {decodeHex, encodeHex} from "../../utils/hex"
import {CardanoWasm} from "../../utils/rustLoader"
import {RawTx, TxCandidate} from "../entities/tx"
import {Prover} from "../wallet/prover"
import {TxAsm} from "../wallet/txAsm"

export interface TxCompletionPipeline {
  complete(txc: TxCandidate): Promise<RawTx>
  completeTransaction(tx: Transaction, partial?: boolean): Promise<RawTx>
}

export function mkTxCompletionPipeline(
  asm: TxAsm,
  prover: Prover,
  network: CardanoNetwork,
  R: CardanoWasm
): TxCompletionPipeline {
  return new DefaultTxCompletionPipeline(asm, prover, network, R)
}

class DefaultTxCompletionPipeline implements TxCompletionPipeline {
  constructor(
    public readonly asm: TxAsm,
    public readonly prover: Prover,
    public readonly network: CardanoNetwork,
    public readonly R: CardanoWasm
  ) {}

  async complete(txc: TxCandidate): Promise<RawTx> {
    const unsignedTx = this.asm.finalize(txc);
    const txHasScriptInputs = txc.inputs.some(i => i.consumeScript);

    const witsWithSignRaw = await this.prover.sign(encodeHex(unsignedTx.to_bytes()), txHasScriptInputs);
    const witsWithSign = this.R.TransactionWitnessSet.from_bytes(decodeHex(witsWithSignRaw));


    const fullWits = unsignedTx.witness_set();
    const vKeys = witsWithSign.vkeys();
    console.log(
      'not signed: ', fullWits,
      '\n',
      'signed: ', witsWithSign, vKeys
    )
    if (vKeys) {
      fullWits.set_vkeys(vKeys);
    }

    const tx = this.R.Transaction.new(unsignedTx.body(), fullWits);
    return encodeHex(tx.to_bytes());
  }

  async completeTransaction(unsignedTx: Transaction, txHasScriptInputs = false): Promise<RawTx> {
    const witsWithSignRaw = await this.prover.sign(encodeHex(unsignedTx.to_bytes()), txHasScriptInputs);
    const witsWithSign = this.R.TransactionWitnessSet.from_bytes(decodeHex(witsWithSignRaw));


    const fullWits = unsignedTx.witness_set();
    const vKeys = witsWithSign.vkeys();
    if (vKeys) {
      fullWits.set_vkeys(vKeys);
    }

    const tx = this.R.Transaction.new(unsignedTx.body(), fullWits);
    return encodeHex(tx.to_bytes());
  }
}
