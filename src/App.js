import Trader from './trader/Trader.js';
import CandleFetcher from './trader/CandleFetcher.js';

class App {
  #trader;
  #candleFetcher;

  async init({ market, intervalBuy, intervalSell }) {
    this.#candleFetcher = new CandleFetcher({ market });
    this.#candleFetcher.batch({ count: 100 });

    this.#trader = new Trader({
      market,
      intervalBuy,
      intervalSell,
      thresholdBuy: -0.002,
      thresholdSellWin: 0.002,
    });

    setTimeout(() => {
      this.#trader.start({ immediate: true });
    }, 3000);
  }
}

export default App;
