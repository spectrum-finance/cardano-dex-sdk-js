import {CardanoNetwork} from "../../quickblue/cardanoNetwork"
import {decodeHex, encodeHex} from "../../utils/hex"
import {CardanoWasm} from "../../utils/rustLoader"
import {RawTx, TxCandidate} from "../entities/tx"
import {Prover} from "../wallet/prover"
import {TxAsm} from "../wallet/txAsm"

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
  ) {
  }

  async complete(txc: TxCandidate): Promise<RawTx> {
    const collectedData = txc.outputs.map(x => x.data)
    const unsignedTx = this.asm.finalize(txc)
    const rawTxWitnessSet = await this.prover.sign(encodeHex(unsignedTx.to_bytes()))
    collectedData.forEach(x => x && this.network.reportDatum(x))

    const txBody = unsignedTx.body();
    const txWitnessSet = this.R.TransactionWitnessSet.from_bytes(decodeHex(rawTxWitnessSet));
    return encodeHex(this.R.Transaction.new(txBody, txWitnessSet).to_bytes());
  }
}
