import { postOrder } from '../api/index.js';
import logger from '../utils/logger.js';
import { COMMISION_RATE } from './constants.js';
import { getRecentSecondCandles } from '../db/candle.js';

function debounceWithBestPrice(func, delay) {
  let timer = null;
  let bestPriceParams = { price: Infinity, volume: null };

  return async function (params) {
    const price = Number(params.price);
    if (price < bestPriceParams.price) {
      bestPriceParams = params;
    }

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    timer = setTimeout(() => {
      func(bestPriceParams);
    }, delay);
  };
}

class Buyer {
  #timer;
  // #loader;
  #isWaitingResume = false;

  #getCurrentPrice = null;
  #getPriceReferences = null;
  // #getPriceSnapshot = null;
  #getBalance = null;

  constructor({
    market,
    proportion = 1.0,
    windowSize = 60,
    threshold = -0.005,
    interval = 60,
    orderType = 'limit',
    timeInForce = undefined,

    currentPrice,
    priceReferences,
    balance,

    //todo
    limit = null,
  }) {
    this.market = market;

    // this.#loader = loader;
    this.#getCurrentPrice = currentPrice;
    // this.#getPriceSnapshot = priceSnapshot;
    this.#getPriceReferences = priceReferences;
    this.#getBalance = balance;

    this.windowSize = windowSize;
    this.threshold = threshold;
    this.proportion = proportion;
    this.interval = interval;
    this.orderType = orderType;
    this.timeInForce = timeInForce;
    this.limit = limit;
  }

  get options() {
    return {
      market: this.market,
      windowSize: this.windowSize,
      threshold: this.threshold,
      proportion: this.proportion,
      interval: this.interval,
      limit: this.limit,
    };
  }
  // get priceSnapshot() {
  //   // return this.#getCurrentPrice();
  //   return this.#getPriceSnapshot();
  // }
  // get priceSnapshot() {
  //   return this.#getPriceSnapshot();
  // }
  get priceReferences() {
    return this.#getPriceReferences();
  }
  get currentPrice() {
    return this.#getCurrentPrice();
  }

  get balance() {
    return this.#getBalance();
  }

  async start({ immediate = false } = {}) {
    logger.debug('Buyer: ', this.options);

    if (immediate) await this.once();

    this.#timer = setInterval(this.once.bind(this), this.interval * 1000);
  }
  stop() {
    clearInterval(this.#timer);
    this.#timer = null;
  }
  pause({ waitResume = false } = {}) {
    this.#isWaitingResume = waitResume;
    this.stop();
  }
  async resume() {
    if (this.#isWaitingResume) {
      await this.once();
      this.#isWaitingResume = false;
    }

    this.start();
  }
  async once() {
    // logger.debug(`[Buyer] START`);
    const { isIn, buyingPrice, rate } = this.consider() ?? {};
    // const balance = await this.#loader.balance?.();

    if (!isIn || !this.balance) {
      logger.debug(`[Buyer] CANCEL: balance: ${this.balance}, rate: ${rate}`);
      return;
    }

    debounceWithBestPrice(
      this.buy.bind(this),
      100
    )({
      price: buyingPrice,
      rate,
    });
  }
  consider() {
    // const recentCandles = await this.getRecentCandles();
    const highest = this.priceReferences?.high;

    if (!highest || !this.currentPrice) {
      logger.debug(
        `[Buyer] Cancel for not enough information - current: ${this.currentPrice}, high: ${highest}`
      );
      return null;
    }

    // const highestOfLows = Math.max(
    //   ...recentCandles.map(({ low_price }) => Number(low_price))
    // );
    const diffRate = (this.currentPrice - highest) / highest;

    return {
      isIn: diffRate <= this.threshold,
      buyingPrice: this.currentPrice,
      rate: diffRate,
    };
  }
  async buy({ price, rate }) {
    const _balance = Math.min(this.balance, this.limit ?? Infinity);
    const volume = (_balance * this.proportion * (1 - COMMISION_RATE)) / price;
    const totalPrice = price * volume;

    if (totalPrice < 5000) {
      logger.info(`[Buyer] 최소주문금액 이하: ${price}, ${rate}`);
      return null;
    }

    const { uuid } = (await this._makeOrder({ price, volume })) ?? {};
    if (uuid) logger.info(`[Buyer] BUY - price: ${price}, rate: ${rate}`);
  }
  async getRecentCandles() {
    const candles = await getRecentSecondCandles({
      market: this.market,
      count: 60,
    });
    return candles?.rows ?? null;
  }
  async _makeOrder({ price, volume }) {
    const response = await postOrder({
      market: this.market,
      side: 'bid',
      ordType: this.orderType,
      price: this.orderType === 'limit' ? price : price * volume,
      volume: this.orderType === 'limit' ? volume : undefined,
      timeInForce: this.timeInForce,
    });
    return response?.data;
  }
}

export default Buyer;
