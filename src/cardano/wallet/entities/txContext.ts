import {SAddr} from "../../entities/address"

export type TxContext = {
  ttl: number
  changeAddr: SAddr
}
