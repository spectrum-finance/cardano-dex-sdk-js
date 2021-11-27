import {MinLovelaceInOutput} from "../../cardano/constants"
import {TxOutCandidate} from "../../cardano/entities/txOut"
import {Value} from "../../cardano/entities/value"
import {notImplemented} from "../../utils/notImplemented"
import {DepositRequest, RedeemRequest, SwapRequest} from "../models/opRequests"
import {NativeOrders} from "../scripts"

export interface AmmOutputs {
  deposit(req: DepositRequest): TxOutCandidate
  redeem(req: RedeemRequest): TxOutCandidate
  swap(req: SwapRequest): TxOutCandidate
}

export class AmmOutputsImpl implements AmmOutputs {
  deposit(req: DepositRequest): TxOutCandidate {
    const value = Value(MinLovelaceInOutput, [req.x, req.y])
    const data = notImplemented()
    return {
      value,
      addr: NativeOrders.depositAddr,
      data
    }
  }

  redeem(req: RedeemRequest): TxOutCandidate {
    const value = Value(MinLovelaceInOutput, req.lp)
    const data = notImplemented()
    return {
      value,
      addr: NativeOrders.redeemAddr,
      data
    }
  }

  swap(req: SwapRequest): TxOutCandidate {
    const value = Value(MinLovelaceInOutput, req.baseInput)
    const data = notImplemented()
    return {
      value,
      addr: NativeOrders.swapAddr,
      data
    }
  }
}
