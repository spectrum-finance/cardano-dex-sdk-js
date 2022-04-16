import {TxOutCandidate} from "../../cardano/entities/txOut"
import {Value} from "../../cardano/entities/value"
import {TxMath} from "../../cardano/wallet/txMath"
import {encodeHex} from "../../utils/hex"
import {CardanoWasm} from "../../utils/rustLoader"
import {mkDepositDatum, mkRedeemDatum, mkSwapDatum} from "../contractData"
import {DepositRequest, RedeemRequest, SwapRequest} from "../models/opRequests"
import {OrderAddrs} from "../scripts"

export interface AmmOutputs {
  deposit(req: DepositRequest): TxOutCandidate

  redeem(req: RedeemRequest): TxOutCandidate

  swap(req: SwapRequest): TxOutCandidate
}

export function mkAmmOutputs(addrs: OrderAddrs, txMath: TxMath, R: CardanoWasm): AmmOutputsImpl {
  return new AmmOutputsImpl(addrs, txMath, R)
}

class AmmOutputsImpl implements AmmOutputs {
  constructor(
    public readonly addrs: OrderAddrs,
    public readonly txMath: TxMath,
    public readonly R: CardanoWasm
  ) {}

  deposit(req: DepositRequest): TxOutCandidate {
    const preValue = Value(1n, [req.x, req.y])
    const minLovelace = this.txMath.minUtxoValue(preValue, true)
    const value = Value(minLovelace, [req.x, req.y])
    const data = encodeHex(mkDepositDatum(req, this.R).to_bytes())
    return {
      value,
      addr: this.addrs.ammDeposit,
      data
    }
  }

  redeem(req: RedeemRequest): TxOutCandidate {
    const preValue = Value(1n, req.lq)
    const minLovelace = this.txMath.minUtxoValue(preValue, true)
    const value = Value(minLovelace, req.lq)
    const data = encodeHex(mkRedeemDatum(req, this.R).to_bytes())
    return {
      value,
      addr: this.addrs.ammRedeem,
      data
    }
  }

  swap(req: SwapRequest): TxOutCandidate {
    const preValue = Value(1n, req.baseInput)
    const minLovelace = this.txMath.minUtxoValue(preValue, true)
    const value = Value(minLovelace, req.baseInput)
    const data = encodeHex(mkSwapDatum(req, this.R).to_bytes())
    return {
      value,
      addr: this.addrs.ammSwap,
      data
    }
  }
}
