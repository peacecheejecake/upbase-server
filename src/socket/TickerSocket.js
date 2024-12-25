import Socket from './base/Socket.js';

class TickerSocket extends Socket {
  // #markets = [];
  // #lastTickers = {};

  #onMessage = null;

  constructor({ markets = [], lazyInit = false, onMessage = null }) {
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

  setMessageHandler(handler = null) {
    this.#onMessage = (data) => {
      const _data = JSON.parse(data.toString()) ?? {};
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
