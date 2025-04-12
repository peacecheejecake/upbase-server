import request from '@/request';
import type {
  GETWithdrawsChange,
  GETWithdraw,
  GETWithdraws,
  POSTWithdrawsCoin,
  POSTWithdrawsKrw,
  GETCoinAddressesWithdrawsAvailable,
} from './types.ts';

export const getWithdrawsChance: GETWithdrawsChange = ({
  currency,
  netType,
}) => {
  return request.get('/v1/withdraws/chance', {
    params: {
      currency,
      net_type: netType,
    },
  });
};

// 출금 UUID를 통해 개별 출금 정보를 조회한다.
export const getWidthdraw: GETWithdraw = ({ uuid, txid, currency }) => {
  return request.get('/v1/withdraw', {
    params: {
      uuid,
      txid,
      currency,
    },
  });
};

export const getWidthdraws: GETWithdraws = ({
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

export const postWithdrawsCoin: POSTWithdrawsCoin = ({
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

export const postWithdrawsKrw: POSTWithdrawsKrw = ({
  amount,
  twoFactorType,
}) => {
  return request.post('/v1/withdraws/krw', {
    amount,
    two_factor_type: twoFactorType,
  });
};

export const getCoinAddressesWithdrawsAvailable: GETCoinAddressesWithdrawsAvailable =
  () => {
    return request.get('/v1/withdraws/coin_addresses');
  };
