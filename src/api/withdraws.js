import request from '../request.js';

export const getWithdrawsChance = ({ currency, netType }) => {
  return request.get('/v1/withdraws/chance', {
    params: {
      currency,
      net_type: netType,
    },
  });
};

// 출금 UUID를 통해 개별 출금 정보를 조회한다.
export const getWidthdraw = ({ uuid, txid, currency }) => {
  return request.get('/v1/withdraw', {
    params: {
      uuid,
      txid,
      currency,
    },
  });
};

export const getWidthdraws = ({
  currency,
  state,
  uuids,
  txids,
  limit,
  page,
  orderBy,
}) => {
  return request.get('/v1/withdraws', {
    params: {
      currency,
      state,
      uuids,
      txids,
      limit,
      page,
      order_by: orderBy,
    },
  });
};

export const postWithdrawCoin = ({
  currency,
  network,
  amount,
  address,
  secondaryAddress,
  transactionType,
}) => {
  return request.post('/v1/withdraws/coin', {
    params: {
      currency,
      netType: network,
      amount,
      address,
      secondary_address: secondaryAddress,
      transaction_type: transactionType,
    },
  });
};
