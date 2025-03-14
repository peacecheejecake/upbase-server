import Trader from './trader/Trader';

interface InitOptions {
	market: string;
	intervalBuy?: number;
	intervalSell?: number;
	orderTypeBuy?: string;
	orderTypeSell?: string;
	thresholdBuy?: number;
	thresholdSellWin?: number;
	thresholdSellLose?: number;
	timeInForce?: string;
	windowSize?: number;
}

class App {
  private trader: Trader;
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
  }: InitOptions) {
    // this.#candleFetcher = new CandleFetcher({ market });
    // this.#candleFetcher.batch({ count: 100 });

    this.trader = new Trader({
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

    this.trader.start({ immediate: true });

    // setTimeout(() => {
    //   this.#trader.start({ immediate: true });
    // }, 3000);
  }
}

export default App;
