export function notImplemented(consumeArgs: unknown[] = []): never {
  consumeArgs
  throw "An implementation is missing"
}
