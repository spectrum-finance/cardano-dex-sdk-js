import {decodeHex, encodeHex} from "../../utils/hex"
import {CardanoWasm} from "../../utils/rustLoader"
import {Bech32String, HexString, PaymentCred} from "../types"

export type Addr = Bech32String

export function Addr(str: string, R: CardanoWasm): Addr | undefined {
  const r = R.Address.from_bech32(str)
  return r ? r.to_bech32() : undefined
}

export type RawAddr = HexString

export function decodeAddr(raw: RawAddr, R: CardanoWasm): Addr {
  return R.Address.from_bytes(decodeHex(raw)).to_bech32()
}

export function extractPayemntCred(addr: Addr, R: CardanoWasm): PaymentCred {
  const wasmAddr = R.Address.from_bech32(addr)
  const wasmCred =
    R.BaseAddress.from_address(wasmAddr)?.payment_cred() ??
    R.EnterpriseAddress.from_address(wasmAddr)?.payment_cred()!
  return encodeHex(wasmCred.to_bytes())
}
