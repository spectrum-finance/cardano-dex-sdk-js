export type CardanoWasm = typeof import("@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib")

class Module {
  _wasm?: CardanoWasm

  async load(node = false): Promise<CardanoWasm> {
    if (this._wasm === undefined) {
      this._wasm = await (node
        // @ts-ignore
        ? import("@emurgo/cardano-serialization-lib-nodejs/cardano_serialization_lib")
        // @ts-ignore
        : import("@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib"))
    }
    return this._wasm!
  }

  get CardanoWasm(): CardanoWasm {
    return this._wasm!
  }
}

// need this otherwise Wallet's flow type isn't properly exported
export const RustModule: Module = new Module()
