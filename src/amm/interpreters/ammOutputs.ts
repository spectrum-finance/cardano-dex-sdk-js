import {OutputCandidate} from "../../cardano/entities/output"
import {PlutusBytes, PlutusMap} from "../../cardano/entities/plutusData"
import {Value} from "../../cardano/entities/value"
import {decodeHex} from "../../utils/hex"
import {DepositRequest, RedeemRequest, SwapRequest} from "../models/opRequests"
import {NativeOrders} from "../scripts"

export interface AmmOutputs {
  deposit(req: DepositRequest): OutputCandidate
  redeem(req: RedeemRequest): OutputCandidate
  swap(req: SwapRequest): OutputCandidate
}

export class AmmOutputsImpl implements AmmOutputs {
  deposit(req: DepositRequest): OutputCandidate {
    const value = Value(0n, [req.x, req.y]) // todo: ADA amount
    const data = PlutusMap({
      userPubKeyHash: PlutusBytes(decodeHex(req.keyHash))
    })
    return {
      value,
      addr: NativeOrders.depositAddr,
      data
    }
  }

  redeem(req: RedeemRequest): OutputCandidate {
    const value = Value(0n, req.lp) // todo: ADA amount
    const data = PlutusMap({
      userPubKeyHash: PlutusBytes(decodeHex(req.keyHash))
    })
    return {
      value,
      addr: NativeOrders.redeemAddr,
      data
    }
  }

  swap(req: SwapRequest): OutputCandidate {
    const value = Value(0n, req.baseInput) // todo: ADA amount
    const data = PlutusMap({
      userPubKeyHash: PlutusBytes(decodeHex(req.keyHash))
    })
    return {
      value,
      addr: NativeOrders.swapAddr,
      data
    }
  }
}
