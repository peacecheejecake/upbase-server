const RESERVED = {
  't-buy': 'thresholdBuy',
  't-sell-win': 'thresholdSellWin',
  't-sell-lose': 'thresholdSellLose',
  market: 'market',
  interval: 'interval',
  'order-type-buy': 'orderTypeBuy',
  'order-type-sell': 'orderTypeSell',
  'time-in-force': 'timeInForce',
};

export const processArguments = (args, keys) => {
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

export const translateKey = (key) => {
  return RESERVED[key];
};

export const isReserved = (key) => {
  return RESERVED[key] !== undefined;
};
