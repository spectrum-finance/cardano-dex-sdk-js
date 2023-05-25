import {TxOutCandidate} from "../../cardano/entities/txOut.js"
import {TxMath} from "../../cardano/wallet/txMath.js"
import {encodeHex} from "../../utils/hex.js"
import {CardanoWasm} from "../../utils/rustLoader.js"
import {mkDepositDatum, mkRedeemDatum, mkSwapDatum} from "../contractData.js"
import {DepositRequest, RedeemRequest, SwapRequest} from "../models/opRequests.js"
import {OrderAddrs} from "../scripts.js"

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
    const data = encodeHex(mkDepositDatum(req, this.R).to_bytes())
    return {
      value: req.orderValue,
      addr: this.addrs.ammDeposit,
      data
    }
  }

  redeem(req: RedeemRequest): TxOutCandidate {
    const data = encodeHex(mkRedeemDatum(req, this.R).to_bytes())
    return {
      value: req.orderValue,
      addr: this.addrs.ammRedeem,
      data
    }
  }

  swap(req: SwapRequest): TxOutCandidate {
    const data = encodeHex(mkSwapDatum(req, this.R).to_bytes())
    return {
      value: req.orderValue,
      addr: this.addrs.ammSwap,
      data
    }
  }
}
