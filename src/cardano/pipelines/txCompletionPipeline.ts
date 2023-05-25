import {CardanoNetwork} from "../../quickblue/cardanoNetwork.js"
import {decodeHex, encodeHex} from "../../utils/hex.js"
import {CardanoWasm} from "../../utils/rustLoader.js"
import {RawTx, TxCandidate} from "../entities/tx.js"
import {Prover} from "../wallet/prover.js"
import {TxAsm} from "../wallet/txAsm.js"

export interface TxCompletionPipeline {
  complete(txc: TxCandidate): Promise<RawTx>
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
    const unsignedTxRaw = this.asm.finalize(txc)
    const unsignedTx = this.R.Transaction.from_bytes(decodeHex(unsignedTxRaw))
    const txHasScriptInputs = txc.inputs.some(i => i.consumeScript)

    const witsWithSignRaw = await this.prover.sign(unsignedTxRaw, txHasScriptInputs)
    const witsWithSign = this.R.TransactionWitnessSet.from_bytes(decodeHex(witsWithSignRaw))

    const fullWits = unsignedTx.witness_set()
    const vKeys = witsWithSign.vkeys()
    if (vKeys) {
      fullWits.set_vkeys(vKeys)
    }

    const tx = this.R.Transaction.new(unsignedTx.body(), fullWits)
    return encodeHex(tx.to_bytes())
  }
}
