interface

const RESERVED = {
  't-buy': 'thresholdBuy',
  't-sell-win': 'thresholdSellWin',
  't-sell-lose': 'thresholdSellLose',
  market: 'market',
  'interval-buy': 'intervalBuy',
  'interval-sell': 'intervalSell',
  'order-type-buy': 'orderTypeBuy',
  'order-type-sell': 'orderTypeSell',
  'time-in-force': 'timeInForce',
  'window-size': 'windowSize',
};

export const processArguments = (args?: string[], keys?: string[]) => {
  const raw = args || process.argv.slice(2);

  const reservedKeys = keys || Object.keys(RESERVED);
  const patternIsReserved = new RegExp(
    `^--(${reservedKeys.join('|')})=[^=]+$`,
    'i'
  );

  return Object.fromEntries(
    raw
      .filter((arg) => patternIsReserved.test(arg))
      .map((arg) => arg.slice(2).split('='))
  );
};

export const translateKey = (key: string) => {
  return RESERVED[key];
};

export const isReserved = (key: string) => {
  return RESERVED[key] !== undefined;
};
