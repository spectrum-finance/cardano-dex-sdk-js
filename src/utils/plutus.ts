import {PlutusData} from "@emurgo/cardano-serialization-lib-nodejs"
import {HexString} from "../cardano/types"
import {decodeHex, encodeHex} from "./hex"
import {CardanoWasm} from "./rustLoader"
import * as F from "ramda"

export function renderPlutusDataTreeUnsafe(raw: HexString, R: CardanoWasm): string {
  function renderIn(pd: PlutusData): string {
    const kind = pd.kind()
    if (kind === R.PlutusDataKind.ConstrPlutusData) {
      const members = pd.as_constr_plutus_data()!.data()
      const ln = members.len()
      let i = 0
      const mRepr: string[] = []
      do {
        const m = members.get(i)
        mRepr.push(renderIn(m))
        i++
      } while (i < ln)
      return (
        "{" +
        F.zip([...Array(ln).keys()], mRepr)
          .map(([k, v]) => `"${k}": ${v}`)
          .join(", ") +
        "}"
      )
    } else if (kind === R.PlutusDataKind.Map) {
      return "<map?>"
    } else if (kind === R.PlutusDataKind.List) {
      return "<list?>"
    } else if (kind === R.PlutusDataKind.Integer) {
      return pd.as_integer()!.to_str()
    } else {
      return '"' + encodeHex(pd.as_bytes()!) + '"'
    }
  }

  const wasmDatum = R.PlutusData.from_bytes(decodeHex(raw))
  const rendered = renderIn(wasmDatum)
  return JSON.stringify(JSON.parse(rendered), null, 2)
}
