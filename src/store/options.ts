import { createAtom } from './base/Atom';

interface Options {
  market?: string;
  intervalBuy?: number;
  intervalSell?: number;
  orderTypeBuy?: string;
  orderTypeSell?: string;
  // thresholdBuy?: number;
  // thresholdSellWin?: number;
  // thresholdSellLose?: number;
  timeInForce?: string;
  windowSize?: number;
}

interface OptionStore {
  options: Options;
}

// const options = {};

const optionStore: OptionStore = {
  options: {},
};

export default optionStore;

const optionsAtom = createAtom<Options>({});
