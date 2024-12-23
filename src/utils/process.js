export const processArguments = (args, keys) => {
  const raw = args || process.argv.slice(2);

  const reservedKeys = keys || [
    'interval',
    't-buy',
    't-sell-win',
    't-sell-lose',
    'market',
    'interval',
    'order-type',
  ];
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
