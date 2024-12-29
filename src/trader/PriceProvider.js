import dayjs from 'dayjs';
import TickerSocket from '../socket/TickerSocket.js';
import logger from '../utils/logger.js';
import { addTicker } from '@/db/ticker.js';

class PriceProvider {
  #stride;
  // #interval;

  #socket;
  #storage = []; // [timestamp]: { timestamp, trade_price }
  // #onChange = null;

  #isCollectingFirstStride = false;

  // #timerStride = null;
  #timerGarbageCollection = null;

  constructor({ stride, market, interval }) {
    this.#stride = stride;
    // this.#interval = interval;

    this.#socket = new TickerSocket({
      markets: [market],
    });
    this.market = market;
  }

  // get lastTimestamp() {
  //   return Object.keys(this.#storage).sort().at(-1);
  // }
  // get intervalStart() {
  //   return dayjs().subtract(this.#interval, 'seconds');
  // }

  get itemsCompared() {
    // const now = dayjs();
    // return Object.fromEntries(
    //   Object.entries(this.#storage).filter(([_, { timestamp }]) => {
    //     const priceTime = dayjs(Number(timestamp));
    //     return (
    //       now.diff(priceTime, 'seconds') <= this.#stride &&
    //       priceTime.isBefore(this.intervalStart)
    //     );
    //   })
    // );
    return this.#storage.slice(-this.#stride - 1, -1);
  }
  // get itemsThisInterval() {
  //   return Object.fromEntries(
  //     Object.entries(this.#storage).filter(([_, { timestamp }]) => {
  //       const priceTime = dayjs(Number(timestamp));
  //       return (
  //         priceTime.isAfter(this.intervalStart) ||
  //         priceTime.isSame(this.intervalStart)
  //       );
  //     })
  //   );
  // }
  // get current() {
  //   return this.#storage[this.lastTimestamp];
  // }

  get prices() {
    return this.#storage.map(({ trade_price }) => Number(trade_price));
  }
  get #pricesCompared() {
    return this.itemsCompared.map(({ trade_price }) => Number(trade_price));
  }
  // get #pricesThisInterval() {
  //   return Object.values(this.itemsThisInterval).map(({ trade_price }) =>
  //     Number(trade_price)
  //   );
  // }
  get currentPrice() {
    // const lastTimestamp = Object.keys(this.#storage).sort().at(-1);
    const price = Number(this.#storage.at(-1)?.trade_price);
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
  // get snapshotThisInterval() {
  //   const high = Math.max(...this.#pricesThisInterval);
  //   const low = Math.min(...this.#pricesThisInterval);
  //   const mid = (high + low) / 2;

  //   return {
  //     high,
  //     low,
  //     mid,
  //   };
  // }

  initialize({ onChange }) {
    this.#socket.setMessageHandler((data) => {
      this.storePrice(data);

      const storageSize = this.#storage.length;

      if (this.#isCollectingFirstStride) {
        const { high, low, mid } = this.snapshotCompared ?? {};
        console.log(
          `[PriceProvider] collecting... ${storageSize}/${this.#stride} - high: ${high}, low: ${low}, mid: ${mid}, current: ${this.currentPrice}`
        );
        if (storageSize >= this.#stride) this.stopCollectingFirstStride();
      }

      if (storageSize > this.#stride)
        onChange?.({ data, snapshot: this.snapshotCompared });
    });

    this.collectPricesForFirstStride();
    // this.#isCollectingFirstStride = true;
    // await this.collectPricesForFirstStride();
    // this.#isCollectingFirstStride = false;

    this.startGarbageCollection();
  }
  reset() {
    this.stopCollectingFirstStride();
    this.stopGarbageCollection();
    this.#storage = [];
  }

  collectPricesForFirstStride() {
    logger.info(
      `Start collecting first prices of ${this.market} for ${this.#stride} seconds.`
    );

    this.#isCollectingFirstStride = true;

    // return new Promise((resolve) => {
    //   // this.#timerStride = setTimeout(() => {
    //   //   logger.info(`Complete collecting first prices of ${this.market}.`);
    //   //   console.log('');
    //   //   this.#timerStride = null;
    //   //   resolve();
    //   // }, this.#stride * 1000);
    //   this.#timerStride = setInterval(() => {}, 1000);
    // });
  }
  stopCollectingFirstStride() {
    // clearTimeout(this.#timerStride);
    // this.#timerStride = null;
    this.#isCollectingFirstStride = false;
    logger.info(
      `Complete collecting first prices of ${this.market}. ${this.#storage.length} data collected.`
    );
  }
  startGarbageCollection() {
    this.#timerGarbageCollection = setInterval(
      // this.deleteInvalidData.bind(this),
      this.deleteOutOfStride.bind(this),
      this.#stride * 1000
    );
  }
  deleteOutOfStride() {
    this.#storage = this.#storage.slice(-this.#stride - 5, -1);
  }
  // deleteInvalidData() {
  //   const now = dayjs();
  //   let numDelete = 0;

  //   Object.keys(this.#storage).forEach((timestamp) => {
  //     if (now.diff(dayjs(Number(timestamp)), 'seconds') > this.#stride) {
  //       delete this.#storage[timestamp];
  //       numDelete += 1;
  //     }
  //   });

  //   logger.debug(
  //     `[PriceProvider] Garbage collection: ${numDelete} deleted, ${Object.keys(this.#storage).length} left.`
  //   );
  // }
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

    // this.#storage[timestamp] = { timestamp, trade_price };
    this.#storage.push({ timestamp, trade_price });
    addTicker(data);

    // const { high, low, mid } = this.snapshotCompared ?? {};
    // console.debug(
    //   `PriceProvider.storePrice: ${trade_price}, high: ${high}, low: ${low}, mid: ${mid}, current: ${this.currentPrice}`
    // );
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
