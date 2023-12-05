import {AdaEntry} from "../../../cardano/entities/assetEntry"
import {FullTxIn} from "../../../cardano/entities/txIn"
import {remove, sum, Value} from "../../../cardano/entities/value"
import {InputSelector} from "../../../cardano/wallet/inputSelector"
import {TxMath} from "../../../cardano/wallet/txMath"
import {getChangeOrderValue} from "../../../utils/getChangeOrderValue"
import {InsufficientFundsForChange, InsufficientFundsForOrderOutput} from "./utils/errors"


export const selectInputs = async (
  totalOrderBudget: Value,
  changeAddress: string,
  inputSelector: InputSelector,
  allInputs: FullTxIn[],
  txMath: TxMath): Promise<FullTxIn[] | Error> => {
  let inputs: FullTxIn[] | Error;

  try {
    inputs = inputSelector.select(allInputs, totalOrderBudget);
  } catch (e) {
    return new InsufficientFundsForOrderOutput("insufficient funds");
  }
  if (inputs instanceof Error || !inputs.length) {
    return new InsufficientFundsForOrderOutput("insufficient funds")
  }

  const normalizeChange = async (inputs: FullTxIn[]): Promise<FullTxIn[] | Error> => {
    const estimatedChange = remove(
      sum(inputs.map(input => input.txOut.value)),
      totalOrderBudget
    );
    const [, additionalAdaForChange] = getChangeOrderValue(estimatedChange, changeAddress, txMath);

    if (!additionalAdaForChange) {
      return Promise.resolve(inputs);
    }
    let additionalInput: FullTxIn[] | Error;

    try {
      additionalInput = inputSelector.select(allInputs,[AdaEntry(additionalAdaForChange)], inputs);
    } catch (e) {
      return new InsufficientFundsForChange("insufficient funds")
    }
    if (additionalInput instanceof Error || !additionalInput.length) {
      return new InsufficientFundsForChange("insufficient funds")
    }
    return normalizeChange(inputs.concat(additionalInput));
  }

  return normalizeChange(inputs);
}
