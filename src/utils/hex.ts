import {Base16} from "../cardano/types"

export function decodeHex(s: Base16): Uint8Array {
  return Uint8Array.from(Buffer.from(s, "hex"))
}

export function encodeHex(arr: Uint8Array): Base16 {
  return Buffer.from(arr).toString("hex")
}
