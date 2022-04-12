import {JSONBI} from "./json"

type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T

type TransformerFn<T> = (v: any) => T

type TransformerObj<T> = T extends (infer U)[]
  ? Partial<{[key in keyof U]: TransformerObj<U[key]>}>
  : T extends Record<string, any>
  ? Partial<{[key in keyof T]: TransformerObj<T[key]>}>
  : TransformerFn<T>

const transformKey = (value: any, rules: TransformerObj<Unpacked<any>> | undefined): any => {
  if (value instanceof Array) {
    return value.map(cv => transformKey(cv, rules))
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).reduce<Record<string, any>>((acc, [key, cv]) => {
      acc[key] = transformKey(cv, rules ? (rules as any)[key] : undefined)

      return acc
    }, {})
  }

  return rules && rules instanceof Function ? rules(value) : value
}

export const mkJsonTransformer = <T>(rules: TransformerObj<Unpacked<Unpacked<T>>>): ((raw: string) => T) => {
  return (raw: string) => {
    const parsed = JSONBI.parse(raw)

    return transformKey(parsed, rules)
  }
}
