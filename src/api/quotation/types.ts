import type { Fetcher } from '@/request';

type CandleUnitMinute =
  | 'minutes'
  | '1minutes'
  | '3minutes'
  | '5minutes'
  | '10minutes'
  | '15minutes'
  | '30minutes'
  | '60minutes'
  | '240minutes';
export type CandleUnit =
  | 'seconds'
  | 'days'
  | 'weeks'
  | 'months'
  | 'years'
  | CandleUnitMinute;

export type GETAvailableMarkets = Fetcher<
  {
    isDetails?: boolean;
  },
  {
    market: string;
    korean_name: string;
    english_name: string;
    market_event?: {
      warning?: boolean;
      caution?: {
        PRICE_FLUCTUATIONS?: boolean;
        TRADING_VOLUME_SOARING?: boolean;
        DEPOSIT_AMOUNT_SOARING?: boolean;
        GLOBAL_PRICE_DIFFERENCES?: boolean;
        CONCENTRATION_OF_SMALL_ACCOUNTS?: boolean;
      };
    };
  }[]
>;

export type GETCandles = Fetcher<
  {
    unit?: CandleUnit;
    market: string;
    to?: string;
    count?: number;
  },
  {
    market: string;
    candle_date_time_utc: string;
    candle_date_time_kst: string;
    opening_price: number;
    high_price: number;
    low_price: number;
    trade_price: number;
    timestamp: number;
    candle_acc_trade_price: number;
    candle_acc_trade_volume: number;
  }[]
>;

export type GETRecentTrades = Fetcher<
  {
    market: string;
    to?: string;
    count?: number;
    cursor?: string;
    daysAgo?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  },
  {
    market: string;
    trade_date_utc: string;
    trade_time_utc: string;
    timestamp: number;
    trade_price: number;
    trade_volume: number;
    prev_closing_price: number;
    change_price: number;
    ask_bid: string;
    sequential_id: number;
  }[]
>;

export type GETCurrentPrices = Fetcher<
  {
    markets: string | string[];
  },
  {
    market: string;
    trade_date: string;
    trade_time: string;
    trade_date_kst: string;
    trade_time_kst: string;
    trade_timestamp: number;
    opening_price: number;
    high_price: number;
    low_price: number;
    trade_price: number;
    prev_closing_price: number;
    change: 'EVEN' | 'RISE' | 'FALL';
    change_price: number;
    change_rate: number;
    signed_change_price: number;
    signed_change_rate: number;
    trade_volume: number;
    acc_trade_pice: number;
    acc_trade_price_24h: number;
    acc_trade_volume: number;
    acc_trade_volume_24h: number;
    highest_52_week_price: number;
    highest_52_week_date: string;
    lowest_52_week_price: number;
    lowest_52_week_date: string;
    timestamp: number;
  }[]
>;

export type GETCurrentPricesForCurrencies = Fetcher<
  {
    currencies: string[];
  },
  {
    market: string;
    trade_date: string;
    trade_time: string;
    trade_date_kst: string;
    trade_time_kst: string;
    trade_timestamp: number;
    opening_price: number;
    high_price: number;
    low_price: number;
    trade_price: number;
    prev_closing_price: number;
    change: 'EVEN' | 'RISE' | 'FALL';
    change_price: number;
    change_rate: number;
    signed_change_price: number;
    signed_change_rate: number;
    trade_volume: number;
    acc_trade_pice: number;
    acc_trade_price_24h: number;
    acc_trade_volume: number;
    acc_trade_volume_24h: number;
    highest_52_week_price: number;
    highest_52_week_date: string;
    lowest_52_week_price: number;
    lowest_52_week_date: string;
    timestamp: number;
  }[]
>;

export type GETOrderbook = Fetcher<
  {
    markets: string | string[];
    level?: number;
  },
  {
    market: string;
    timestamp: number;
    total_ask_size: number;
    total_bid_size: number;
    orderbook_units: {
      ask_price: number;
      bid_price: number;
      ask_size: number;
      bid_size: number;
    }[];
    level?: number;
  }[]
>;

export type GETSupportedLevelsOfOrderbook = Fetcher<
  {},
  {
    market: string;
    supported_levels: number[];
  }[]
>;

// interface GetAvailableMarketsParams {
//   isDetails?: boolean;
// }
// interface GetCandlesParams {
//   unit?: CandleUnit;
//   market: string;
//   to?: string;
//   count: number;
// }
// interface GetRecentTradesParams {
//   market: string;
//   to?: string;
//   count: number;
//   cursor: string;
//   daysAgo: number;
// }
