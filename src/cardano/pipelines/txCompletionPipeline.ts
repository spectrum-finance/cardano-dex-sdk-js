import {CardanoNetwork} from "../../quickblue/cardanoNetwork"
import {RawTx, TxCandidate} from "../entities/tx"
import {Prover} from "../wallet/prover"
import {TxAsm} from "../wallet/txAsm"

export interface TxCompletionPipeline {
  complete(txc: TxCandidate): Promise<RawTx>
}

export function mkTxCompletionPipeline(
  asm: TxAsm,
  prover: Prover,
  network: CardanoNetwork
): TxCompletionPipeline {
  return new DefaultTxCompletionPipeline(asm, prover, network)
}

class DefaultTxCompletionPipeline implements TxCompletionPipeline {
  constructor(
    public readonly asm: TxAsm,
    public readonly prover: Prover,
    public readonly network: CardanoNetwork
  ) {}
  async complete(txc: TxCandidate): Promise<RawTx> {
    const collectedData = txc.outputs.map(x => x.data)
    const rawTx = await this.prover.sign(this.asm.finalize(txc))
    await Promise.all(collectedData.map(x => (x ? this.network.reportDatum(x) : Promise.resolve())))
    return rawTx
  }
}
