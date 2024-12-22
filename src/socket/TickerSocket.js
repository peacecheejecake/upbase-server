import Socket from './base/Socket.js';

class TickerSocket extends Socket {
  #markets = [];
  #lastTickers = {};

  constructor({ markets = [], lazyInit = false }) {
    super({
      requestData: [
        { ticket: `ticker-${markets.join(',')}` },
        { type: 'ticker', codes: markets },
        // { type: 'ticker', codes: markets, is_only_realtime: true },
        { format: 'DEFAULT' },
      ],
      lazyInit,
      onMessage: (data) => {
        const { code, ...marketData } = JSON.parse(data.toString()) ?? {};

        if (!code) return;

        this.#lastTickers = {
          ...this.#lastTickers,
          [code]: marketData,
        };

        console.log(
          `[TickerSocket] ${code} - ${marketData.trade_price}, ${marketData.stream_type}`
        );
      },
    });

    this.#markets = markets;
  }
  currentPrice(market) {
    const _market = market || this.#markets[0];
    return this.#lastTickers[_market]?.trade_price;
  }
}

export default TickerSocket;
