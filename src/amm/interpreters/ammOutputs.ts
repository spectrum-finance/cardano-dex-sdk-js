import {TxOutCandidate} from "../../cardano/entities/txOut"
import {PlutusBytes, PlutusMap} from "../../cardano/entities/plutusData"
import {Value} from "../../cardano/entities/value"
import {decodeHex} from "../../utils/hex"
import {DepositRequest, RedeemRequest, SwapRequest} from "../models/opRequests"
import {NativeOrders} from "../scripts"

export interface AmmOutputs {
  deposit(req: DepositRequest): TxOutCandidate
  redeem(req: RedeemRequest): TxOutCandidate
  swap(req: SwapRequest): TxOutCandidate
}

export class AmmOutputsImpl implements AmmOutputs {
  deposit(req: DepositRequest): TxOutCandidate {
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

  redeem(req: RedeemRequest): TxOutCandidate {
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

  swap(req: SwapRequest): TxOutCandidate {
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
