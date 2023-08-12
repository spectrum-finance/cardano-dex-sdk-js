import {TxOutCandidate} from "../../cardano/entities/txOut"
import {remove, Value} from "../../cardano/entities/value";
import {TxMath} from "../../cardano/wallet/txMath"
import {encodeHex} from "../../utils/hex"
import {CardanoWasm} from "../../utils/rustLoader"
import {mkDepositDatum, mkPoolDatum, mkRedeemDatum, mkSwapDatum} from "../contractData"
import {calculateInitUserRewardLq} from "../math/pool";
import {DepositRequest, PoolCreationRequest, RedeemRequest, SwapRequest} from "../models/opRequests"
import {OrderAddrs} from "../scripts"

export interface AmmOutputs {
  deposit(req: DepositRequest): TxOutCandidate[]

  redeem(req: RedeemRequest): TxOutCandidate[]

  swap(req: SwapRequest): TxOutCandidate[]

  poolCreation(req: PoolCreationRequest): TxOutCandidate[]
}

export function mkAmmOutputs(addrs: OrderAddrs, txMath: TxMath, R: CardanoWasm): AmmOutputsImpl {
  return new AmmOutputsImpl(addrs, txMath, R)
}

class AmmOutputsImpl implements AmmOutputs {
  constructor(
    public readonly addrs: OrderAddrs,
    public readonly txMath: TxMath,
    public readonly R: CardanoWasm
  ) {
  }

  deposit(req: DepositRequest): TxOutCandidate[] {
    const data = encodeHex(mkDepositDatum(req, this.R).to_bytes())
    return [{
      value: req.orderValue,
      addr: this.addrs.ammDeposit,
      data
    }]
  }

  redeem(req: RedeemRequest): TxOutCandidate[] {
    const data = encodeHex(mkRedeemDatum(req, this.R).to_bytes())
    return [{
      value: req.orderValue,
      addr: this.addrs.ammRedeem,
      data
    }]
  }

  swap(req: SwapRequest): TxOutCandidate[] {
    const data = encodeHex(mkSwapDatum(req, this.R).to_bytes())
    return [{
      value: req.orderValue,
      addr: this.addrs.ammSwap,
      data
    }]
  }

  poolCreation(req: PoolCreationRequest): TxOutCandidate[] {
    const data = encodeHex(mkPoolDatum(req, this.R).to_bytes())
    const userOutputValue = Value(req.minAdaForUserOutput, calculateInitUserRewardLq(req.x, req.y, req.lq.asset))
    const poolOutput = {
      value: remove(req.poolValue, userOutputValue),
      addr: this.addrs.ammPool,
      data
    }
    const userLqOutput = {
      value: userOutputValue,
      addr: req.userAddress,
      data
    }
    return [poolOutput, userLqOutput]
  }
}
