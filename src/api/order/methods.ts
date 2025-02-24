import request from '../../request';
import type {
  GETAccount,
  GETOrderChance,
  GETOrdersByIds,
  GETOrder,
  GETOpenOrders,
  GETClosedOrders,
  DELETEOrder,
  DELETEOpenOrders,
  DELETEOrdersOfUuids,
  POSTOrder,
  POSTCancelAndNewOrder,
} from './types';

export const getAccounts: GETAccount = () => {
  return request.get('/v1/accounts');
};

export const getOrderChance: GETOrderChance = ({ market }) => {
  return request.get('/v1/orders/chance', {
    params: { market },
  });
};

export const getOrdersByIds: GETOrdersByIds = ({ uuids, identifiers }) => {
  return request.get('/v1/orders/uuids', {
    params: {
      uuids: uuids?.slice(0, 100),
      identifiers: uuids ? undefined : identifiers?.slice(0, 100),
    },
  });
};

export const getOrder: GETOrder = ({ uuid, identifier }) => {
  return request.get('/v1/orders', {
    params: {
      uuid,
      identifier,
    },
  });
};

export const getOpenOrders: GETOpenOrders = ({
  market,
  state,
  states,
  page,
  limit,
  orderBy,
}) => {
  return request.get('/v1/orders/open', {
    params: {
      market,
      state,
      states: states?.map?.((state) => `state[]=${state}`)?.join('&'),
      page,
      limit,
      order_by: orderBy,
    },
  });
};

export const getClosedOrders: GETClosedOrders = ({
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

export const deleteOrder: DELETEOrder = ({ uuid, identifier }) => {
  return request.delete('/v1/order', {
    params: {
      uuid,
      identifier,
    },
  });
};

export const deleteOpenOrders: DELETEOpenOrders = ({
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
      pairs: pairs?.slice(0, 20)?.join?.(','),
      excluded_pairs: excludedPairs?.slice(0, 20)?.join(','),
      quote_currencies: quoteCurrencies?.join(','),
      count,
      order_by: orderBy,
    },
  });
};

export const deleteOrdersOfUuids: DELETEOrdersOfUuids = ({
  uuids,
  identifiers,
}) => {
  return request.delete('/v1/orders', {
    params: {
      uuids: uuids?.slice(0, 20),
      identifiers: identifiers?.slice(0, 20),
    },
  });
};

export const postOrder: POSTOrder = ({
  market,
  side,
  volume,
  price,
  ordType,
  identifier,
  timeInForce,
}) => {
  return request.post('/v1/orders', null, {
    params: {
      market,
      side,
      volume,
      price,
      ord_type: ordType || (side === 'bid' ? 'price' : 'market'),
      identifier,
      time_in_force: timeInForce,
    },
  });
};

export const postCancelAndNewOrder: POSTCancelAndNewOrder = ({
  prevOrderUuid,
  prevOrderIdentifier,
  newOrdType,
  newVolume,
  newPrice,
  newIdentifier,
  newTimeInForce,
}) => {
  if (
    (!prevOrderUuid && !prevOrderIdentifier) ||
    (prevOrderUuid && prevOrderIdentifier)
  )
    throw Error('prevOrderUuid와 prevOrderIdentifer 둘 중 하나를 사용하세요.');

  if (prevOrderIdentifier && prevOrderIdentifier === newIdentifier)
    throw Error('prevOrderIdentifier와 newIdentifier는 달라야 합니다.');

  // TODO: JSON 전송 확인
  return request.post('/v1/orders/cancel_and_new', {
    prev_order_uuid: prevOrderUuid,
    prev_order_identifier: prevOrderIdentifier,
    new_ord_type: newOrdType,
    new_volume: newVolume,
    new_price: newPrice,
    new_identifier: newIdentifier,
    new_time_in_force: newTimeInForce,
  });
};
