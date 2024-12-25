import Trader from './trader/Trader.js';
import CandleFetcher from './trader/CandleFetcher.js';

class App {
  #trader;
  // #candleFetcher;

  async init({
    market,
    intervalBuy,
    intervalSell,
    orderTypeBuy,
    orderTypeSell,
    thresholdBuy = -0.005,
    thresholdSellWin = 0.005,
    thresholdSellLose = -0.02,
    timeInForce = undefined,
    windowSize = 60,
  }) {
    // this.#candleFetcher = new CandleFetcher({ market });
    // this.#candleFetcher.batch({ count: 100 });

    this.#trader = new Trader({
      market,
      intervalBuy,
      intervalSell,
      thresholdBuy,
      thresholdSellWin,
      thresholdSellLose,
      orderTypeBuy,
      orderTypeSell,
      timeInForce,
      windowSize,
    });

    this.#trader.start({ immediate: true });

    // setTimeout(() => {
    //   this.#trader.start({ immediate: true });
    // }, 3000);
  }
}

export default App;
