import {MinLovelaceInOutput} from "../../cardano/constants"
import {TxOutCandidate} from "../../cardano/entities/txOut"
import {Value} from "../../cardano/entities/value"
import {encodeHex} from "../../utils/hex"
import {CardanoWasm} from "../../utils/rustLoader"
import {mkDepositDatum, mkRedeemDatum, mkSwapDatum} from "../contractData"
import {DepositRequest, RedeemRequest, SwapRequest} from "../models/opRequests"
import {NativeOrders} from "../scripts"

export interface AmmOutputs {
  deposit(req: DepositRequest): TxOutCandidate

  redeem(req: RedeemRequest): TxOutCandidate

  swap(req: SwapRequest): TxOutCandidate
}

export function mkAmmOutputs(R: CardanoWasm): AmmOutputsImpl {
  return new AmmOutputsImpl(R)
}

class AmmOutputsImpl implements AmmOutputs {
  constructor(public readonly R: CardanoWasm) {}

  deposit(req: DepositRequest): TxOutCandidate {
    const value = Value(MinLovelaceInOutput, [req.x, req.y])
    const data = encodeHex(mkDepositDatum(req, this.R).to_bytes())
    return {
      value,
      addr: NativeOrders.depositAddr,
      data
    }
  }

  redeem(req: RedeemRequest): TxOutCandidate {
    const value = Value(MinLovelaceInOutput, req.lp)
    const data = encodeHex(mkRedeemDatum(req, this.R).to_bytes())
    return {
      value,
      addr: NativeOrders.redeemAddr,
      data
    }
  }

  swap(req: SwapRequest): TxOutCandidate {
    const value = Value(MinLovelaceInOutput, req.baseInput)
    const data = encodeHex(mkSwapDatum(req, this.R).to_bytes())
    return {
      value,
      addr: NativeOrders.swapAddr,
      data
    }
  }
}
