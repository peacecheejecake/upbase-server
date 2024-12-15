import dayjs from 'dayjs';
import { getCandles, postOrder, getOrdersByIds } from '../api';
import { addOrder } from '../db/order';
import logger from '../utils/logger';
import { COMMISION_RATE } from './constants';
// import { modifyOrderHoldingState } from '../db/order.js';
// import { average } from '../utils';

class Buyer {
  #timer;
  #loader;
  #isWaitingResume = false;

  constructor({
    market,
    loader = {},
    windowSize = 60,
    threshold = -0.005,
    proportion = 1.0,
    interval = 60,
    limit = null,
  }) {
    this.market = market;

    this.#loader = loader;

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
    logger.debug(`[Buyer] START`);
    const { isIn, buyingPrice, rate } = (await this.consider()) ?? {};
    const balance = await this.#loader.balance?.();

    if (!isIn || !balance) {
      logger.debug(`[Buyer] CANCEL: balance: ${balance}, rate: ${rate}`);
      return;
    }

    const data = await this.buy({
      price: buyingPrice,
      balance,
    });
    const { uuid } = data ?? {};

    if (uuid) {
      logger.info(`[Buyer] BUY - price: ${buyingPrice}, rate: ${rate}`);
      this.addOrderToDatabase(data);
    }
  }
  async consider() {
    const pastCandles = await this._getSecondCandles();
    const currentPrice = await this.#loader.currentPrice();

    if (!pastCandles || !currentPrice) return null;

    const highestOfLows = Math.max(
      ...pastCandles.map(({ low_price }) => Number(low_price))
    );
    const diffRate = (currentPrice - highestOfLows) / highestOfLows;

    return {
      isIn: diffRate <= this.threshold,
      buyingPrice: currentPrice,
      rate: diffRate,
    };
  }
  async buy({ price, balance }) {
    const _balance = Math.min(balance, this.limit ?? Infinity);
    // const _volume =
    //   () / price;'
    // logger.debug(
    //   `balance: ${_balance}, COMMISION_RATE: ${COMMISION_RATE}, proportion: ${this.proportion}, price: ${_balance * this.proportion * (1 - COMMISION_RATE)}`
    // );
    return await this._makeOrder({
      price: _balance * this.proportion * (1 - COMMISION_RATE),
      // volume: _volume,
    });
  }
  async addOrderToDatabase({ uuid }) {
    // const { side, ...order } = data;

    // const { remaining_volume, executed_volume } = order;
    // console.log(order);
    // const volume = Number(remaining_volume) + Number(executed_volume);

    // await addOrder({
    //   ...order,
    //   volume,
    //   holding: false,
    // });

    //todo
    this.checkOrderUntilClosed({ uuid });

    // setTimeout(() => {
    //   modifyOrderHoldingState({ uuid: data.uuid, holding: true });
    // }, 1000);
  }
  checkOrderUntilClosed({ uuid }) {
    logger.debug(`[Buyer] checkOrderUntilClosed START: ${uuid}`);
    const timer = setInterval(async () => {
      const response = await getOrdersByIds({ uuids: [uuid] });

      const order = (response?.data ?? []).find(
        ({ uuid: _uuid, state }) => _uuid === uuid
      );

      if (order?.state === 'done') {
        clearInterval(timer);
        // modifyOrderHoldingState({ uuid, holdiang: true });
        addOrder({ ...order, holding: true });
        logger.info(`[Buyer] checkOrderUntilClosed CLOSED: ${uuid}`);
      }
    }, 1000);
  }

  async _getMinuteCandles() {
    const response = await getCandles({
      unit: 'minutes',
      market: this.market,
      count: this.windowSize,
    });
    return response?.data?.length > 0 ? response.data : null;
  }
  async _getSecondCandles() {
    const response = await getCandles({
      unit: 'seconds',
      market: this.market,
      count: this.windowSize,
    });
    return response?.data?.length > 0 ? response.data : null;
  }
  async _makeOrder({ price, volume }) {
    if (price < 5000) {
      logger.warn(`[Buyer] 최소주문금액 이하: ${price}`);
      return null;
    }
    const response = await postOrder({
      market: this.market,
      side: 'bid',
      ordType: 'price',
      price,
      // volume,
    });
    return response?.data;
  }
}

export default Buyer;
