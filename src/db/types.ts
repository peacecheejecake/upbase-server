export interface HistorySecondTable {
  market: string;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  timestamp: BigInt;
  candle_acc_trade_price: number;
  candle_date_time_utc: string;
  candle_date_time_kst: string;
}

export interface OrdersBuyTable {
  uuid: string;
  ord_type: string;
  price: number;
  state: string;
  market: string;
  created_at: string;
  volume: number;
  remaining_volume: number;
  reserved_fee: number;
  remaining_fee: number;
  paid_fee: number;
  locked: number;
  executed_volume: number;
  executed_funds: number;
  trades_count: number;
  time_in_force: string;
  identifier: string;
  holding: boolean;
  side: string;
  unit_price: number;
}

export interface TickersTable {
  market: string;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  prev_closing_price: number;
  change: string;
  signed_change_price: number;
  signed_change_rate: number;
  trade_volume: number;
  acc_trade_volume: number;
  acc_trade_volume_24h: number;
  acc_trade_price: number;
  acc_trade_price_24h: number;
  trade_date: string;
  trade_time: string;
  trade_timestamp: number;
  chanage_price: number;
  change_rate: number;
  type: string;
  ask_bid: string;
  acc_ask_volume: number;
  acc_bid_volume: number;
  highest_52_week_price: number;
  highest_52_week_date: string;
  market_state: string;
  is_trading_suspended: boolean;
  delisting_date: string;
  market_warning: string;
  stream_type: string;
  lowest_52_week_price: number;
  lowest_52_week_date: string;
  timestamp: number;
}
