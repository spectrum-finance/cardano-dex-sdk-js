export type CardanoWasm =
  typeof import("@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib.js")

interface ModuleConfig {
  env: "nodejs" | "browser"
}

class Module {
  _wasm?: CardanoWasm

  async load(conf: ModuleConfig): Promise<CardanoWasm> {
    if (this._wasm === undefined) {
      this._wasm = await (conf.env === "nodejs"
        ? import("@emurgo/cardano-serialization-lib-nodejs/cardano_serialization_lib.js")
        : import("@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib.js"))
    }
    return this._wasm!
  }

  get CardanoWasm(): CardanoWasm {
    return this._wasm!
  }
}

// need this otherwise Wallet's flow type isn't properly exported
export const RustModule: Module = new Module()
