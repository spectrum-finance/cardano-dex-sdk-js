import {Addr} from "../cardano/entities/address"
import {AdaEntry} from "../cardano/entities/assetEntry"
import {TxOutCandidate} from "../cardano/entities/txOut"
import {add, getLovelace, Value} from "../cardano/entities/value"
import {TxMath} from "../cardano/wallet/txMath"

export function getChangeOrderValue (
  change: Value,
  addr: Addr,
  txMath: TxMath
): [Value, bigint] {
  const estimatedChangeOutput: TxOutCandidate = {
    value: change,
    addr
  }
  console.log('test 0.5')
  const requiredAdaForChange = txMath.minAdaRequiredforOutput(estimatedChangeOutput);
  console.log('test 0.7')
  const changeLovelace = getLovelace(change);
  console.log('test 0.9')
  if (!changeLovelace.amount) {
    return [add(change, AdaEntry(requiredAdaForChange)), requiredAdaForChange];
  }
  if (changeLovelace.amount >= requiredAdaForChange) {
    return [change, 0n];
  }
  return [
    add(change, AdaEntry(requiredAdaForChange - changeLovelace.amount)),
    requiredAdaForChange - changeLovelace.amount
  ]
}
