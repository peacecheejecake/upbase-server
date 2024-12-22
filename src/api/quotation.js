import request from '../request.js';

export const getAvailableMarkets = ({ isDetails = false }) => {
  return request.get('/v1/market/all', {
    params: {
      is_details: isDetails,
    },
  });
};

export const getCandles = ({ unit = 'minutes', market, to, count }) => {
  const pathParam = (() => {
    if (['seconds', 'days', 'weeks', 'months', 'years'].includes(unit)) {
      return unit;
    }

    if (/^\d{0,3}minutes$/.test(unit)) {
      const num = unit.match(/^\d{1,3}/)?.[0] ?? '1';
      if ([1, 3, 5, 15, 10, 30, 60, 240].includes(parseInt(num))) {
        return `minutes/${num}`;
      }
    }

    throw Error('Invalid unit');
  })();

  if (count > 200) {
    throw Error('Too many count');
  }

  return request.get(`/v1/candles/${pathParam}`, {
    params: {
      market,
      to,
      count,
    },
  });
};

export const getRecentTrades = ({ market, to, count, cursor, daysAgo }) => {
  return request.get('/v1/trades/ticks', {
    params: {
      market,
      to,
      count,
      cursor,
      days_ago: daysAgo,
    },
  });
};

export const getCurrentPrices = ({ markets }) => {
  return request.get('/v1/ticker', {
    params: {
      markets: Array.isArray(markets) ? markets.join(',') : markets,
    },
  });
};

export const getCurrentPricesForCurrencies = ({ currencies }) => {
  return request.get('/v1/ticker/all', {
    params: {
      quote_currencies: currencies.join(','),
    },
  });
};

export const getOrderbook = ({ markets, level }) => {
  return request.get('/v1/orderbook', {
    params: {
      market: Array.isArray(markets) ? markets.join(',') : markets,
      count,
    },
  });
};

export const getSupportedLevelsOfOrderbook = () => {
  return request.get('/v1/orderbook/supported_levels');
};
