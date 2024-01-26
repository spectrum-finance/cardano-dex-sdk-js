import {TxOutCandidate} from "../../cardano/entities/txOut"
import {add, remove, Value} from "../../cardano/entities/value"
import {TxMath} from "../../cardano/wallet/txMath"
import {encodeHex} from "../../utils/hex"
import {CardanoWasm} from "../../utils/rustLoader"
import {mkDepositDatum, mkLockLiquidityDatum, mkPoolDatum, mkRedeemDatum, mkSwapDatum} from "../contractData"
import {calculateInitUserRewardLq} from "../math/pool";
import {
  DepositRequest,
  LockLiquidityRequest,
  PoolCreationRequest,
  RedeemRequest,
  SwapRequest
} from "../models/opRequests"
import {OrderAddrs, ScriptCredsV1} from "../scripts"

export interface AmmOutputs {
  deposit(req: DepositRequest): TxOutCandidate[]

  redeem(req: RedeemRequest): TxOutCandidate[]

  swap(req: SwapRequest): TxOutCandidate[]

  poolCreation(req: PoolCreationRequest): TxOutCandidate[]

  lockLiquidity(req: LockLiquidityRequest): TxOutCandidate[]
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
      value: remove(add(add(req.poolValue, req.lq.toEntry), req.nft.toEntry), userOutputValue),
      addr: 'addr1x94ec3t25egvhqy2n265xfhq882jxhkknurfe9ny4rl9k6dj764lvrxdayh2ux30fl0ktuh27csgmpevdu89jlxppvrst84slu',
      data
    }
    const userLqOutput = {
      value: userOutputValue,
      addr: req.userAddress,
    }
    return [poolOutput, userLqOutput]
  }

  lockLiquidity(req: LockLiquidityRequest): TxOutCandidate[] {
    console.log(req);
    const addrWithStake = req.stake ?
      this.R.BaseAddress.new(
        1,
        this.R.StakeCredential.from_scripthash(this.R.ScriptHash.from_hex(ScriptCredsV1.ammLock)),
        req.stake
      ).to_address().to_bech32() :
      this.addrs.ammLock
    console.log(addrWithStake, );
    const data = encodeHex(mkLockLiquidityDatum(req, this.R).to_bytes())
    return [{
      value: req.orderValue,
      addr: addrWithStake,
      data
    }]
  }
}
