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
  const inputs = await inputSelector.select(totalOrderBudget)

  if (inputs instanceof Error) {
    throw new Error("insufficient funds")
  }

  const normalizeChange = async (inputs: FullTxIn[]): Promise<FullTxIn[] | Error> => {
    console.log('calling');
    console.log('inputs', inputs);
    const estimatedChange = remove(
      sum(inputs.map(input => input.txOut.value)),
      totalOrderBudget
    );
    const [, additionalAdaForChange] = getChangeOrderValue(estimatedChange, changeAddress, txMath);
    console.log('additionalChange', additionalAdaForChange);
    if (additionalAdaForChange) {
      const additionalInput = await inputSelector.select([AdaEntry(additionalAdaForChange)], inputs);

      if (additionalInput instanceof Error) {
        throw new Error("insufficient funds")
      }
      return normalizeChange(inputs.concat(additionalInput));
    } else {
      return Promise.resolve(inputs);
    }
  }

  return normalizeChange(inputs);
}
