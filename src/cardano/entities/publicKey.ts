import {decodeHex, encodeHex} from "../../utils/hex"
import {RustModule} from "../../utils/rustLoader"
import {HexString, Hash28} from "../types"
import {SAddr} from "./address"

export type SPubKey = HexString

export type PubKeyHash = Hash28

export function pubKeyHashFromAddr(addr: SAddr): PubKeyHash | undefined {
  const bytes = RustModule.CardanoWasm.RewardAddress.from_address(
    RustModule.CardanoWasm.Address.from_bytes(decodeHex(addr))
  )
    ?.payment_cred()
    .to_keyhash()
    ?.to_bytes()
  return bytes ? encodeHex(bytes) : undefined
}
