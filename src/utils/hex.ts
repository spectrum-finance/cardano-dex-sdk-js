import {HexString} from "../cardano/types.ts"

export function decodeHex(s: HexString): Uint8Array {
  return Uint8Array.from(Buffer.from(s, "hex"))
}

export function encodeHex(arr: Uint8Array): HexString {
  return Buffer.from(arr).toString("hex")
}
