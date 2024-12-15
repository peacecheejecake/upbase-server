import { getCandles, getAccounts, getCurrentPrices } from '../api';
import { average } from '../utils';
import logger from '../utils/logger';
import Buyer from './Buyer';
import Seller from './Seller';

class Trader {
  constructor({
    market,
    windowSize = 60,
    thresholdBuy = -0.005,
    thresholdSellWin = 0.005,
    thresholdSellLose = -0.02,
    proportion = 1.0,
    intervalBuy = 60,
    intervalSell = 60,
  }) {
    this.market = market;

    this.buyer = new Buyer({
      market,
      proportion,
      windowSize,
      threshold: thresholdBuy,
      interval: intervalBuy,
      loader: {
        balance: this.getBalanceKRW.bind(this),
        currentPrice: this.getCurrentPrice.bind(this),
      },
    });
    this.seller = new Seller({
      market,
      thresholdWin: thresholdSellWin,
      thresholdLose: thresholdSellLose,
      interval: intervalSell,
      loader: {
        currentPrice: this.getCurrentPrice.bind(this),
      },
    });
  }
  start({ immediate = false } = {}) {
    this.buyer.start({ immediate });
    this.seller.start({ immediate });
  }
  async getCurrentPrice() {
    const response = await getCandles({
      unit: 'seconds',
      market: this.market,
      count: 1,
    });
    // const response = await getCurrentPrices({ markets: this.market });

    if (!response?.data?.length) return null;

    const { trade_price } = response.data[0];
    return Number(trade_price);

    // const { high_price, low_price } = response.data[0];
    // const median = average(high_price, low_price);
    // return median;
  }
  async getBalanceKRW() {
    const response = await getAccounts();
    if (!response?.data?.length) return null;

    const krw = response.data.find(
      ({ unit_currency }) => unit_currency === 'KRW'
    );
    return Number(krw.balance);
  }
}

export default Trader;
