import JSONBigInt from "json-bigint"

export const JSONBI = JSONBigInt({useNativeBigInt: true, constructorAction: "preserve"})
export const JSONBI_ALWAYS = JSONBigInt({
  useNativeBigInt: true,
  alwaysParseAsBig: true,
  constructorAction: "preserve"
})
