import { getAccounts } from '../api/index.js';
import logger from '../utils/logger.js';
import { deboucnce } from '../utils/debounce.js';
import Buyer from './Buyer.js';
import Seller from './Seller.js';
// import CandleFetcher from './CandleFetcher.js';

import PriceProvider from './PriceProvider.js';

// import TickerSocket from '../socket/TickerSocket.js';
import MyAssetSocket from '../socket/MyAssetSocket.js';
import MyOrderSocket from '../socket/MyOrderSocket.js';

class Trader {
  #sockets = {
    // ticker: null,
    myAsset: null,
    myOrder: null,
  };
  // #candleFetcher;
  #priceProvider;

  constructor({
    market,
    windowSize = 60,
    thresholdBuy = -0.005,
    thresholdSellWin = 0.005,
    thresholdSellLose = -0.02,
    orderTypeBuy = 'limit',
    orderTypeSell = 'limit',
    proportion = 1.0,
    intervalBuy = 60,
    intervalSell = 60,
    timeInForce = undefined,
  }) {
    this.market = market;

    this.buyer = new Buyer({
      market,
      proportion,
      windowSize,
      threshold: thresholdBuy,
      interval: intervalBuy,
      orderType: orderTypeBuy,
      // currentPrice: this.getCurrentPrice.bind(this),
      currentPrice: () => this.#priceProvider.currentPrice,
      priceReferences: () => this.#priceProvider.snapshotCompared,
      balance: this.getBalanceKRW.bind(this),
      timeInForce,
      // loader: {
      //   balance: this.getBalanceKRW.bind(this),
      //   currentPrice: this.getCurrentPrice.bind(this),
      // },
    });
    this.seller = new Seller({
      market,
      thresholdWin: thresholdSellWin,
      thresholdLose: thresholdSellLose,
      interval: intervalSell,
      orderType: orderTypeSell,
      // currentPrice: this.getCurrentPrice.bind(this),
      currentPrice: () => this.#priceProvider.currentPrice,
      balance: this.getBalanceCoin.bind(this),
      timeInForce,
      // loader: {
      //   currentPrice: this.getCurrentPrice.bind(this),
      // },
    });
    // this.#candleFetcher = new CandleFetcher({ market: this.market });
    this.#priceProvider = new PriceProvider({
      stride: windowSize,
      market: this.market,
      interval: intervalBuy,
    });
  }

  async start({ immediate = false } = {}) {
    await this.startSockets();
    await this.#priceProvider.initialize({
      onChange: deboucnce(this.once.bind(this), 150),
    });

    if (immediate) await this.once();

    // setInterval(() => {
    // this.fetchCandle();
    // this.once();
    // }, this.buyer.interval * 1000);

    // this.buyer.start({ immediate });
    // this.seller.start({ immediate });
  }
  async once() {
    await this.buyer?.once?.();
    await this.seller?.once?.();
  }
  // async fetchCandle() {
  //   try {
  //     const data = await this.#candleFetcher.fetch({
  //       count: this.buyer.interval * 2,
  //     });
  //     await this.#candleFetcher.toDatabase(data);
  //   } catch (error) {
  //     logger.error('CandleFetcher error', error);
  //   }
  // }
  async initializeSockets() {
    const initialAssets = (await getAccounts())?.data ?? [];

    this.#sockets = {
      // ticker: new TickerSocket({
      //   markets: [this.market],
      //   lazyInit: true,
      // }),
      myAsset: new MyAssetSocket({
        lazyInit: true,
        initialAssets,
      }),
      myOrder: new MyOrderSocket({
        lazyInit: true,
      }),
    };
  }
  async startSockets() {
    await this.initializeSockets();
    Object.values(this.#sockets).forEach((socket) => {
      socket.start();
    });
  }
  getCurrentPrice() {
    return () => this.#priceProvider.currentPrice;
    //todo
    // return this.#sockets.ticker.currentPrice(this.market);
    // const response = await getCandles({
    //   unit: 'seconds',
    //   market: this.market,
    //   count: 1,
    // });
    // // const response = await getCurrentPrices({ markets: this.market });

    // if (!response?.data?.length) return null;

    // const { trade_price } = response.data[0];
    // return Number(trade_price);

    // const { high_price, low_price } = response.data[0];
    // const median = average(high_price, low_price);
    // return median;
  }
  getBalanceKRW() {
    const assets = this.#sockets.myAsset?.currentAssets?.();
    // if (!assets) return null;
    // const krw = assets.find(({ currency }) => currency === 'KRW');
    return assets?.KRW?.balance ?? null;
  }
  getBalanceCoin() {
    const assets = this.#sockets.myAsset?.currentAssets?.();
    // if (!assets) return null;
    // const coin = assets.find(
    //   ({ currency }) => currency === this.market.split('-')[1]
    // );
    // return coin?.balance;
    return assets?.[this.market.split('-')[1]]?.balance ?? null;
  }

  // async getBalanceKRW() {
  //   const response = await getAccounts();
  //   if (!response?.data?.length) return null;

  //   const krw = response.data.find(
  //     ({ unit_currency }) => unit_currency === 'KRW'
  //   );
  //   return Number(krw.balance);
  // }
}

export default Trader;
