import {MinLovelaceInOutput} from "../../cardano/constants"
import {TxOutCandidate} from "../../cardano/entities/txOut"
import {Value} from "../../cardano/entities/value"
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

export function mkAmmOutputs(addrs: OrderAddrs, R: CardanoWasm): AmmOutputsImpl {
  return new AmmOutputsImpl(addrs, R)
}

class AmmOutputsImpl implements AmmOutputs {
  constructor(
    public readonly addrs: OrderAddrs,
    public readonly R: CardanoWasm
  ) {}

  deposit(req: DepositRequest): TxOutCandidate {
    const value = Value(MinLovelaceInOutput, [req.x, req.y])
    const data = encodeHex(mkDepositDatum(req, this.R).to_bytes())
    return {
      value,
      addr: this.addrs.ammDeposit,
      data
    }
  }

  redeem(req: RedeemRequest): TxOutCandidate {
    const value = Value(MinLovelaceInOutput, req.lq)
    const data = encodeHex(mkRedeemDatum(req, this.R).to_bytes())
    return {
      value,
      addr: this.addrs.ammRedeem,
      data
    }
  }

  swap(req: SwapRequest): TxOutCandidate {
    const value = Value(MinLovelaceInOutput, req.baseInput)
    const data = encodeHex(mkSwapDatum(req, this.R).to_bytes())
    return {
      value,
      addr: this.addrs.ammSwap,
      data
    }
  }
}
