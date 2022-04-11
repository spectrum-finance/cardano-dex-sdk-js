import {decodeHex, encodeHex} from "../../utils/hex"
import {RustModule} from "../../utils/rustLoader"
import {Addr, Hash28, HexString, RawAddr} from "../types"

export type SPubKey = HexString

export type PubKeyHash = Hash28

export function pubKeyHashFromAddr(addr: Addr): PubKeyHash | undefined {
  const bytes = RustModule.CardanoWasm.RewardAddress.from_address(
    RustModule.CardanoWasm.Address.from_bech32(addr)
  )
    ?.payment_cred()
    .to_keyhash()
    ?.to_bytes()
  return bytes ? encodeHex(bytes) : undefined
}

export function pubKeyHashFromRawAddr(addr: RawAddr): PubKeyHash | undefined {
  const bytes = RustModule.CardanoWasm.RewardAddress.from_address(
    RustModule.CardanoWasm.Address.from_bytes(decodeHex(addr))
  )
    ?.payment_cred()
    .to_keyhash()
    ?.to_bytes()
  return bytes ? encodeHex(bytes) : undefined
}
