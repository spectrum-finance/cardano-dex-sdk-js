import {decodeHex, encodeHex} from "../../utils/hex"
import {CardanoWasm} from "../../utils/rustLoader"
import {Hash28, HexString} from "../types"
import {Addr, RawAddr} from "./address"

export type SPubKey = HexString

export type PubKeyHash = Hash28

export function pubKeyHashFromAddr(addr: Addr, R: CardanoWasm): PubKeyHash | undefined {
  const bytes = R.BaseAddress.from_address(R.Address.from_bech32(addr))
    ?.payment_cred()
    .to_keyhash()
    ?.to_bytes()
  return bytes ? encodeHex(bytes) : undefined
}

export function pubKeyHashFromRawAddr(addr: RawAddr, R: CardanoWasm): PubKeyHash | undefined {
  const bytes = R.BaseAddress.from_address(R.Address.from_bytes(decodeHex(addr)))
    ?.payment_cred()
    .to_keyhash()
    ?.to_bytes()
  return bytes ? encodeHex(bytes) : undefined
}
