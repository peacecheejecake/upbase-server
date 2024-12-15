import request from '../request.js';

export const getAccounts = () => {
  return request.get('/v1/accounts');
};

export const getOrderChance = ({ market }) => {
  return request.get('/v1/orders/chance', {
    params: { market },
  });
};

export const getOrdersByIds = ({ uuids, identifiers }) => {
  return request.get('/v1/orders/uuids', {
    params: {
      uuids: uuids?.slice(0, 100),
      // identifiers: identifiers?.slice(0, 100),
    },
  });
};

export const getOrder = ({ uuid, identifier }) => {
  return request.get('/v1/orders', {
    params: {
      uuid,
      identifier,
    },
  });
};

export const getOpenOrders = ({
  market,
  state,
  states,
  page,
  limit,
  orderBy,
}) => {
  return request.get('/v1/orders/open', {
    market,
    state,
    states: states?.map?.((state) => `state[]=${state}`)?.join('&'),
    page,
    limit,
    order_by: orderBy,
  });
};

export const getClosedOrders = ({
  market,
  state,
  states,
  startTime,
  endTime,
  limit,
  orderBy,
} = {}) => {
  return request.get('/v1/orders/closed', {
    params: {
      market,
      state,
      states: states?.map?.((state) => `state[]=${state}`)?.join('&'),
      start_time: startTime,
      end_time: endTime,
      limit,
      order_by: orderBy,
    },
  });
};

export const deleteOrder = ({ uuid, identifier }) => {
  return request.delete('/v1/order', {
    params: {
      uuid,
      identifier,
    },
  });
};

export const deleteOpenOrders = ({
  cancelSide,
  pairs,
  excludedPairs,
  quoteCurrencies,
  count,
  orderBy,
}) => {
  return request.delete('/v1/orders/open', {
    params: {
      cancel_side: cancelSide,
      pairs: pairs?.slice(0, 20)?.join(','),
      excluded_pairs: excludedPairs?.slice(0, 20)?.join(','),
      quote_currencies: quoteCurrencies?.join(','),
      count,
      order_by: orderBy,
    },
  });
};

export const deleteOrdersOfUuids = ({ uuids, identifiers }) => {
  return request.delete('/v1/orders', {
    params: {
      uuids: uuids?.slice(0, 20),
      identifiers: identifiers?.slice(0, 20),
    },
  });
};

export const postOrder = ({
  market,
  side,
  volume,
  price,
  ordType = 'limit',
  identifier,
  timeInForce,
}) => {
  return request.post('/v1/orders', null, {
    params: {
      market,
      side,
      volume,
      price,
      ord_type: ordType,
      identifier,
      time_in_force: timeInForce,
    },
  });
};
