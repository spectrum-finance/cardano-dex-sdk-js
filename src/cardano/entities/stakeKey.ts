import {decodeHex, encodeHex} from "../../utils/hex.ts"
import {CardanoWasm} from "../../utils/rustLoader.ts"
import {Hash28} from "../types.ts"
import {Addr, RawAddr} from "./address.ts"

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
