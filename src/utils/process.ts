interface ReservedOptions {
  't-buy': string;
  't-sell-win': string;
  't-sell-lose': string;
  market: string;
  'interval-buy': string;
  'interval-sell': string;
  'order-type-buy': string;
  'order-type-sell': string;
  'time-in-force': string;
  'window-size': string;
}

const RESERVED: ReservedOptions = {
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
