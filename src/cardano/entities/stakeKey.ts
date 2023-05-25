import {decodeHex, encodeHex} from "../../utils/hex.js"
import {CardanoWasm} from "../../utils/rustLoader.js"
import {Hash28} from "../types.js"
import {Addr, RawAddr} from "./address.js"

export type StakeKeyHash = Hash28

export function stakeKeyHashFromAddr(addr: Addr, R: CardanoWasm): StakeKeyHash | undefined {
  const bytes = R.BaseAddress.from_address(R.Address.from_bech32(addr))?.stake_cred().to_keyhash()?.to_bytes()
  return bytes ? encodeHex(bytes) : undefined
}

export function stakeKeyHashFromRawAddr(addr: RawAddr, R: CardanoWasm): StakeKeyHash | undefined {
  const bytes = R.BaseAddress.from_address(R.Address.from_bytes(decodeHex(addr)))
    ?.stake_cred()
    .to_keyhash()
    ?.to_bytes()
  return bytes ? encodeHex(bytes) : undefined
}
