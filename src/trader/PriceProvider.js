import dayjs from 'dayjs';
import TickerSocket from '../socket/TickerSocket.js';
import { average } from '../utils/index.js';
import logger from '../utils/logger.js';
import { resolve } from 'specifier-resolution-node';

class PriceProvider {
  #stride;
  #interval;

  #socket;
  #storage = {}; // [timestamp]: { timestamp, trade_price }
  #onChange = null;

  #timerStride = null;
  #timerGarbageCollection = null;

  constructor({ stride, market, interval }) {
    this.#stride = stride;
    this.#interval = interval;

    this.#socket = new TickerSocket({
      markets: [market],
    });
    this.market = market;
  }

  get lastTimestamp() {
    return Object.keys(this.#storage).sort().at(-1);
  }
  get intervalStart() {
    return dayjs().subtract(this.#interval, 'seconds');
  }

  get itemsCompared() {
    const now = dayjs();
    return Object.fromEntries(
      Object.entries(this.#storage).filter(([_, { timestamp }]) => {
        const priceTime = dayjs(Number(timestamp));
        return (
          now.diff(priceTime, 'seconds') <= this.#stride &&
          priceTime.isBefore(this.intervalStart)
        );
      })
    );
  }
  get itemsThisInterval() {
    return Object.fromEntries(
      Object.entries(this.#storage).filter(([_, { timestamp }]) => {
        const priceTime = dayjs(Number(timestamp));
        return (
          priceTime.isAfter(this.intervalStart) ||
          priceTime.isSame(this.intervalStart)
        );
      })
    );
  }
  // get current() {
  //   return this.#storage[this.lastTimestamp];
  // }

  get prices() {
    return Object.values(this.#storage).map(({ trade_price }) =>
      Number(trade_price)
    );
  }
  get #pricesCompared() {
    return Object.values(this.itemsCompared).map(({ trade_price }) =>
      Number(trade_price)
    );
  }
  get #pricesThisInterval() {
    return Object.values(this.itemsThisInterval).map(({ trade_price }) =>
      Number(trade_price)
    );
  }
  get currentPrice() {
    // const lastTimestamp = Object.keys(this.#storage).sort().at(-1);
    const price = Number(this.#storage[this.lastTimestamp]?.trade_price);
    return !isNaN(price) ? price : null;
  }

  // get highPrice() {
  //   return Math.max(...this.historyPrices);
  // }
  // get lowPrice() {
  //   return Math.min(...this.historyPrices);
  // }
  // // get averagePrice() {
  // //   return average(...this.historyPrices);
  // // }
  // get midPrice() {
  //   return (this.highPrice + this.lowPrice) / 2;
  // }

  get snapshotCompared() {
    if (!this.#pricesCompared.length) return null;

    const high = Math.max(...this.#pricesCompared);
    const low = Math.min(...this.#pricesCompared);
    const mid = (high + low) / 2;

    return {
      high,
      low,
      mid,
    };
  }
  get snapshotThisInterval() {
    const high = Math.max(...this.#pricesThisInterval);
    const low = Math.min(...this.#pricesThisInterval);
    const mid = (high + low) / 2;

    return {
      high,
      low,
      mid,
    };
  }

  async initialize({ onChange }) {
    this.#socket.setMessageHandler((data) => {
      this.storePrice(data);
      this.#onChange?.({ data, snapshot: this.snapshotCompared });
    });

    await this.collectPricesForFirstStride();

    this.#onChange = onChange;
    this.startGarbageCollection();
  }
  reset() {
    this.stopFirstStride();
    this.stopGarbageCollection();
    this.#storage = {};
  }

  async collectPricesForFirstStride() {
    logger.info(
      `Start collecting first prices of ${this.market} for ${this.#stride} seconds.`
    );

    return new Promise((resolve) => {
      this.#timerStride = setTimeout(() => {
        logger.info(`Complete collecting first prices of ${this.market}.`);
        console.log('');
        this.#timerStride = null;
        resolve();
      }, this.#stride * 1000);
    });
  }
  stopFirstStride() {
    clearTimeout(this.#timerStride);
    this.#timerStride = null;
  }

  startGarbageCollection() {
    this.#timerGarbageCollection = setInterval(
      this.deleteInvalidData.bind(this),
      this.#stride * 1000
    );
  }
  deleteInvalidData() {
    const now = dayjs();
    let numDelete = 0;

    Object.keys(this.#storage).forEach((timestamp) => {
      if (now.diff(dayjs(Number(timestamp)), 'seconds') > this.#stride) {
        delete this.#storage[timestamp];
        numDelete += 1;
      }
    });

    logger.debug(
      `[PriceProvider] Garbage collection: ${numDelete} deleted, ${Object.keys(this.#storage).length} left.`
    );
  }
  stopGarbageCollection() {
    clearInterval(this.#timerGarbageCollection);
    this.#timerGarbageCollection = null;
  }

  storePrice(data) {
    const { timestamp, trade_price } = data;

    if (!timestamp) {
      logger.error('PriceProvider.storePrice: timestamp is required');
      return;
    }

    this.#storage[timestamp] = { timestamp, trade_price };

    const { high, low, mid } = this.snapshotCompared ?? {};
    console.debug(
      `PriceProvider.storePrice: ${trade_price}, high: ${high}, low: ${low}, mid: ${mid}, current: ${this.currentPrice}`
    );
  }

  // getIntervalSnapshot({ interval }) {
  //   const _now = dayjs();
  //   const prices = Object.values(this.#storage)
  //     .filter(({ timestamp }) => {
  //       return _now.diff(dayjs(Number(timestamp)), 'seconds') <= interval;
  //     })
  //     .map(({ trade_price }) => Number(trade_price));

  //   const high = Math.max(...prices);
  //   const low = Math.min(...prices);
  //   const avg = average(...prices);

  //   return {
  //     high,
  //     low,
  //     avg,
  //     mid: (high + low) / 2,
  //     current: this.currentPrice,
  //   };
  // }
}

export default PriceProvider;
