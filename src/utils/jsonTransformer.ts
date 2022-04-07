type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;

type TransformerFn<T> = (v: any) => T;

type TransformerObj<T> = T extends Record<string, any>
  ? { [key in keyof T]: TransformerObj<T[key]> }
  : TransformerFn<T>;

export class JsonTransformer<T> {
  constructor(private rules: Partial<TransformerObj<Unpacked<Unpacked<T>>>>) {
  }

  transform(raw: string): T {
    const parsed = JSON.parse(raw)

    return this.transformKey(parsed, this.rules)
  }

  private transformKey(
    value: any,
    rules: Partial<TransformerObj<Unpacked<any>>> | undefined
  ): any {
    if (value instanceof Array) {
      return value.map((cv) => this.transformKey(cv, rules))
    }
    if (value instanceof Object) {
      return Object.entries(value).reduce<Record<string, any>>((acc, [key, cv]) => {
        acc[key] = this.transformKey(
          cv,
          rules ? (rules as any)[key] : undefined
        )

        return acc
      }, {})
    }

    return rules && rules instanceof Function ? rules(value) : value
  }
}
