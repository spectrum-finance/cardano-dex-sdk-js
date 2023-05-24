import {decodeHex, encodeHex} from "../../utils/hex.ts"
import {CardanoWasm} from "../../utils/rustLoader.ts"
import {Bech32String, HexString, PaymentCred} from "../types.ts"

export type Addr = Bech32String

export function Addr(str: string, R: CardanoWasm): Addr | undefined {
  const r = R.Address.from_bech32(str)
  return r ? r.to_bech32() : undefined
}

export type RawAddr = HexString

export function decodeAddr(raw: RawAddr, R: CardanoWasm): Addr {
  return R.Address.from_bytes(decodeHex(raw)).to_bech32()
}

export function extractPaymentCred(addr: Addr, R: CardanoWasm): PaymentCred {
  const wasmAddr = R.Address.from_bech32(addr)
  const wasmPaymentCred =
    R.BaseAddress.from_address(wasmAddr)?.payment_cred() ??
    R.EnterpriseAddress.from_address(wasmAddr)?.payment_cred()
  const wasmCredHash = wasmPaymentCred.to_keyhash() ?? wasmPaymentCred.to_scripthash()!

  return encodeHex(wasmCredHash.to_bytes())
}
