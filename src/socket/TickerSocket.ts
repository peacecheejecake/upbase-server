import Socket from './base/Socket.js';
import type { SocketCommon } from './types';

export interface TickerData {
  type: 'ticker';
  code: string;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  prev_closing_price: number;
  change: 'RISE' | 'EVEN' | 'FALL';
  change_price: number;
  signed_change_price: number;
  change_rate: number;
  signed_change_rate: number;
  trade_volume: number;
  acc_trade_volume: number;
  acc_trade_volume_24h: number;
  acc_trade_price: number;
  acc_trade_price_24h: number;
  trade_date: string;
  trade_time: string;
  trade_timestamp: number;
  ask_bid: 'ASK' | 'BID';
  acc_ask_volume: number;
  acc_bid_volume: number;
  highest_52_week_price: number;
  highest_52_week_date: number;
  lowest_52_week_price: number;
  lowest_52_week_date: number;
  trade_status?: string;
  market_state: 'PREVIEW' | 'ACTIVE' | 'DELISTED';
  market_state_for_ios?: string;
  is_trading_suspended?: boolean;
  delisting_date: string;
  market_warning: 'NONE' | 'CAUTION';
  timestamp: number;
  stream_type: 'SNAPSHOT' | 'REALTIME';
}

interface TickerSocketConstructorOptions {
  markets?: string[];
  lazyInit?: boolean;
  onMessage?: (data: TickerData) => void;
}

class TickerSocket extends Socket {
  // #markets = [];
  // #lastTickers = {};

  #onMessage = null;

  constructor({
    markets = [],
    lazyInit = false,
    onMessage = null,
  }: TickerSocketConstructorOptions) {
    super({
      requestData: [
        { ticket: `ticker-${markets.join(',')}` },
        // { type: 'ticker', codes: markets },
        { type: 'ticker', codes: markets, is_only_realtime: true },
        { format: 'DEFAULT' },
      ],
      lazyInit,
      onMessage: (data) => {
        this.#onMessage(data);
      },
    });

    this.setMessageHandler(onMessage);

    // this.#markets = markets;
  }

  setMessageHandler(handler?: (data: TickerData) => void) {
    this.#onMessage = (ws: WebSocket, data: TickerData) => {
      const _data = JSON.parse(data.toString()) ?? ({} as TickerData);
      const { code, trade_price, stream_type } = _data;

      if (!code) return;

      // this.#lastTickers = {
      //   ...this.#lastTickers,
      //   [code]: _data,
      // };

      handler?.(_data);

      // console.log(`[TickerSocket] ${code} - ${trade_price}, ${stream_type}`);
    };
  }
  // currentPrice(market) {
  //   const _market = market || this.#markets[0];
  //   return this.#lastTickers[_market]?.trade_price;
  // }
}

export default TickerSocket;
