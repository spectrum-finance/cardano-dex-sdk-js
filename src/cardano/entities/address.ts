import {decodeHex} from "../../utils/hex"
import {CardanoWasm} from "../../utils/rustLoader"
import {Bech32String, HexString} from "../types"

export type Addr = Bech32String

export function Addr(str: string, R: CardanoWasm): Addr | undefined {
  const r = R.Address.from_bech32(str)
  return r ? r.to_bech32() : undefined
}

export type RawAddr = HexString

export function decodeAddr(raw: RawAddr, R: CardanoWasm): Addr {
  return R.Address.from_bytes(decodeHex(raw)).to_bech32()
}
