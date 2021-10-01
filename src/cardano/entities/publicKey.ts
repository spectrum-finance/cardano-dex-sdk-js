import {Hash28, HexString} from "../types"
import {SAddr} from "./address"
import {RustModule} from "../../utils/rustLoader"
import {decodeHex, encodeHex} from "../../utils/hex"

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
