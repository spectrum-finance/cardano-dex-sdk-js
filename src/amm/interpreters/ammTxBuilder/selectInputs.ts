import {AdaEntry} from "../../../cardano/entities/assetEntry"
import {FullTxIn} from "../../../cardano/entities/txIn"
import {remove, sum, Value} from "../../../cardano/entities/value"
import {InputSelector} from "../../../cardano/wallet/inputSelector"
import {TxMath} from "../../../cardano/wallet/txMath"
import {getChangeOrderValue} from "../../../utils/getChangeOrderValue"


export const selectInputs = async (
  totalOrderBudget: Value,
  changeAddress: string,
  inputSelector: InputSelector,
  txMath: TxMath): Promise<FullTxIn[] | Error> => {
  let inputs: FullTxIn[] | Error;

  try {
    inputs = await inputSelector.select(totalOrderBudget);
  } catch (e) {
    return new Error("insufficient funds");
  }
  if (inputs instanceof Error || !inputs.length) {
    return new Error("insufficient funds")
  }

  const normalizeChange = async (inputs: FullTxIn[]): Promise<FullTxIn[] | Error> => {
    const estimatedChange = remove(
      sum(inputs.map(input => input.txOut.value)),
      totalOrderBudget
    );
    const [, additionalAdaForChange] = getChangeOrderValue(estimatedChange, changeAddress, txMath);
    console.log(additionalAdaForChange, 'additional change')
    if (!additionalAdaForChange) {
      return Promise.resolve(inputs);
    }
    let additionalInput: FullTxIn[] | Error;

    try {
      additionalInput = await inputSelector.select([AdaEntry(additionalAdaForChange)], inputs);
      console.log(additionalInput, 'selector input')
      console.log(inputs, 'current inputs')
    } catch (e) {
      console.log(e, 'selector error');
      console.log(inputs, 'current inputs')
      return new Error("insufficient funds")
    }
    if (additionalInput instanceof Error || !additionalInput.length) {
      return new Error("insufficient funds")
    }
    console.log('next loop');
    console.log('new inputs', inputs.concat(additionalInput));
    return normalizeChange(inputs.concat(additionalInput));
  }

  return normalizeChange(inputs);
}
