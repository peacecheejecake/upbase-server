import type { Fetcher } from '@/request';

export type WithdrawState =
  | 'WAITING'
  | 'PROCESSING'
  | 'DONE'
  | 'FAILED'
  | 'CANCELED'
  | 'REJECTED';
export type TransactionType = 'default' | 'internal';
export type TwoFactorType = 'kakao' | 'naver' | 'hana';

export type GETWithdrawsChange = Fetcher<
  {
    currency: string;
    netType: string;
  },
  {
    member_level: {
      security_level: number;
      fee_level: number;
      email_verified: boolean;
      identity_auth_verified: boolean;
      bank_account_verified: boolean;
      two_factor_auth_verified?: boolean;
      locked: boolean;
      wallet_locked: boolean;
    };
    currency: {
      code: string;
      withdraw_fee: NumberString;
      is_coin: boolean;
      wallet_state: string;
      wallet_support: string[];
    };
    account: {
      currency: string;
      balance: NumberString;
      locked: NumberString;
      buy_price: NumberString;
      buy_price_modified: boolean;
      unit_currency: string;
    };
    withdraw_limit: {
      currency: string;
      minimum: NumberString;
      onetime?: NumberString;
      daily?: NumberString;
      remaining_daily?: NumberString;
      remaining_daily_krw?: NumberString;
      remaining_daily_fiat?: NumberString;
      fiat_currenty: string;
      withdraw_delayed_fiat?: NumberString;
      fixed: number;
      can_withdraw: boolean;
    };
  }
>;

export type GETWithdraw = Fetcher<
  {
    uuid: string;
    txid: string;
    currency: string;
  },
  {
    type: string;
    uuid: string;
    currency: string;
    net_type?: string;
    txid: string;
    state: string;
    created_at: string;
    done_at?: string;
    amount: NumberString;
    fee: NumberString;
    transaction_type?: TransactionType;
  }
>;

export type GETWithdraws = Fetcher<
  {
    currency?: string;
    state?: string;
    uuids?: string[];
    txids?: string[];
    limit?: number;
    page?: number;
    orderBy?: 'asc' | 'desc';
  },
  {
    type: string;
    uuid: string;
    currency: string;
    net_type?: string;
    txid: string;
    state: WithdrawState;
    created_at: string;
    done_at?: string;
    amount: NumberString;
    fee: NumberString;
    transcation_type?: TransactionType;
  }
>;

export type POSTWithdrawsCoin = Fetcher<
  {
    currency: string;
    network: string;
    amount: NumberString;
    address: string;
    secondaryAddress?: string;
    transactionType: TransactionType;
  },
  {
    type: string;
    uuid: string;
    currency: string;
    net_type: string;
    txid: string;
    state: string;
    created_at: DateString;
    done_at: DateString;
    amount: NumberString;
    fee: NumberString;
    krw_amount: NumberString;
    transaction_type: TransactionType;
  }
>;

export type POSTWithdrawsKrw = Fetcher<
  {
    amount: number;
    twoFactorType: TwoFactorType;
  },
  {
    type: string;
    uuid: string;
    currency: string;
    txid: string;
    state: string;
    created_at: DateString;
    done_at: DateString;
    amount: NumberString;
    fee: NumberString;
    transaction_type: TransactionType;
  }
>;

export type GETCoinAddressesWithdrawsAvailable = Fetcher<
  {},
  {
    currency: string;
    net_type: string;
    network_name: string;
    withdraw_address: string;
    secondary_address: string;
  }
>;
