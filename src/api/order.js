import request from '../request.js';

export const getAccounts = () => {
  return request.get('/v1/accounts');
};

export const getOrderChance = ({ market }) => {
  return request.get('/v1/orders/chance', {
    params: { market },
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
}) => {
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
