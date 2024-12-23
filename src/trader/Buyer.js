import { postOrder } from '../api/index.js';
import logger from '../utils/logger.js';
import { COMMISION_RATE } from './constants.js';
import { getRecentSecondCandles } from '../db/candle.js';

class Buyer {
  #timer;
  // #loader;
  #isWaitingResume = false;

  #getCurrentPrice = null;
  #getBalance = null;

  constructor({
    market,
    proportion = 1.0,
    // loader = {},
    windowSize = 60,
    threshold = -0.005,
    interval = 60,

    currentPrice,
    balance,

    //todo
    limit = null,
  }) {
    this.market = market;

    // this.#loader = loader;
    this.#getCurrentPrice = currentPrice;
    this.#getBalance = balance;

    this.windowSize = windowSize;
    this.threshold = threshold;
    this.proportion = proportion;
    this.interval = interval;
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
    const { isIn, buyingPrice, rate } = (await this.consider()) ?? {};
    // const balance = await this.#loader.balance?.();

    if (!isIn || !this.balance) {
      logger.debug(`[Buyer] CANCEL: balance: ${this.balance}, rate: ${rate}`);
      return;
    }

    const data = await this.buy({
      price: buyingPrice,
      rate,
    });
    const { uuid } = data ?? {};

    if (uuid) {
      logger.info(`[Buyer] BUY - price: ${buyingPrice}, rate: ${rate}`);
    }
  }
  async consider() {
    const recentCandles = await this.getRecentCandles();

    if (!recentCandles || !this.currentPrice) return null;

    const highestOfLows = Math.max(
      ...recentCandles.map(({ low_price }) => Number(low_price))
    );
    const diffRate = (this.currentPrice - highestOfLows) / highestOfLows;

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
      logger.warn(`[Buyer] 최소주문금액 이하: ${price}, ${rate}`);
      return null;
    }

    return await this._makeOrder({
      ordType: 'limit',
      price,
      volume,
    });
  }
  async getRecentCandles() {
    const candles = await getRecentSecondCandles({
      market: this.market,
      count: 60,
    });
    return candles?.rows ?? null;
  }
  async _makeOrder({ ordType = 'limit', price, volume }) {
    const response = await postOrder({
      market: this.market,
      side: 'bid',
      ordType,
      price: ordType === 'price' ? price * volume : price,
      volume: ordType === 'price' ? undefined : volume,
    });
    return response?.data;
  }
}

export default Buyer;
