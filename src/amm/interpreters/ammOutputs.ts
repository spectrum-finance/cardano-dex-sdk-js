import {DepositRequest, RedeemRequest, SwapRequest} from "../models/opRequests"
import {OutputCandidate} from "../../cardano/entities/output"
import {NativeOrders} from "../scripts"
import {PlutusBytes, PlutusMap} from "../../cardano/entities/plutusData"
import {decodeHex} from "../../utils/hex"
import {notImplemented} from "../../utils/notImplemented"

export interface AmmOutputs {
  deposit(req: DepositRequest): OutputCandidate
  redeem(req: RedeemRequest): OutputCandidate
  swap(req: SwapRequest): OutputCandidate
}

export class AmmOutputsImpl implements AmmOutputs {
  deposit(req: DepositRequest): OutputCandidate {
    const value = {
      coins: 0n,
      assets: [req.x.toEntry, req.y.toEntry]
    }
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
    const value = {
      coins: 0n,
      assets: [req.lp.toEntry]
    }
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
    return notImplemented([req])
  }
}
