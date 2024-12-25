import logger from '../utils/logger.js';
import { getOrders, modifyOrderHoldingState } from '../db/order.js';
import { postOrder, getAccounts } from '../api/index.js';

class Seller {
  #timer;
  #getCurrentPrice = null;
  // #getPriceSnapshot = null;
  #getBalance = null;
  // #loader;
  // #buyer;

  constructor({
    market,
    // loader,
    // buyer,
    thresholdWin = 0.005,
    thresholdLose = -0.02,
    interval = 60,
    orderType = 'limit',
    currentPrice,
    // priceSnapshot,
    balance,
    timeInForce,

    //todo
    periodLimit = null,
  }) {
    this.market = market;

    this.#getCurrentPrice = currentPrice;
    // this.#getPriceSnapshot = priceSnapshot;
    this.#getBalance = balance;

    // this.#loader = loader;
    // this.#buyer = buyer;

    this.thresholdWin = thresholdWin;
    this.thresholdLose = thresholdLose;
    this.interval = interval;
    this.orderType = orderType;
    this.periodLimit = periodLimit;
    this.timeInForce = timeInForce;
  }

  get options() {
    return {
      market: this.market,
      thresholdWin: this.thresholdWin,
      thresholdLose: this.thresholdLose,
      interval: this.interval,
      periodLimit: this.periodLimit,
    };
  }
  get currentPrice() {
    return this.#getCurrentPrice();
    // return this.#getPriceSnapshot()?.current;
  }
  get balance() {
    return this.#getBalance();
  }

  async start({ immediate = false } = {}) {
    logger.debug('Seller: ', this.options);

    if (immediate) await this.once();

    this.#timer = setInterval(this.once.bind(this), this.interval * 1000);
  }
  stop() {
    clearInterval(this.#timer);
    this.#timer = null;
  }
  async once() {
    // logger.debug(`[Seller] START`);
    const { holdingOrders, sellingList } = (await this.consider()) ?? {};
    // const { rate, sellingPrice, isOut, balance } =
    //   (await this.consider()) ?? {};

    if (!sellingList?.length || !this.currentPrice) {
      // if (!isOut) {
      logger.debug(`[Seller] CANCEL:`, {
        // rates: JSON.stringify(rates),
        currentPrice: this.currentPrice,
        holdingOrders: holdingOrders?.length,
        sellingList: sellingList?.length,
        // sellingPrice,
      });
      return;
    }

    let volumeNotSold = 0;

    sellingList.forEach(
      async ({ uuid: uuidBuy, executed_volume, price, unit_price, rate }) => {
        const volume = Number(executed_volume);
        // const price = Number(unit_price);
        const { uuid: uuidSell, error } =
          (await this.sell({
            price: this.currentPrice,
            volume: this.balance ? Math.min(this.balance, volume) : volume,
          })) ?? {};

        if (error?.name === 'insufficient_funds_ask') {
          //todo
          volumeNotSold += volume;

          modifyOrderHoldingState({ uuid: uuidBuy, holding: false });
          return;
        }

        if (!uuidSell) return;

        modifyOrderHoldingState({ uuid: uuidBuy, holding: false });

        logger.info(
          `[Seller] SELL - price(sell): ${this.currentPrice}, price(buy): ${unit_price}, rate: ${rate}, volume: ${volume}`
        );
      }
    );

    if (volumeNotSold > 0) {
      setTimeout(async () => {
        const balance = (await this.getCoinAccount())?.balance;

        if (balance > 0) {
          logger.info(`[Seller] Try to sell not sold: ${volumeNotSold}`);

          const { uuid } =
            (await this.sell({
              price: this.currentPrice,
              volume: Math.min(balance, volumeNotSold),
            })) ?? {};

          if (uuid) {
            logger.info(
              `[Seller] SELL - price: ${sellingList}, volume: ${volumeNotSold}`
            );
          }
        }
      }, 1000);
    }
  }
  async consider() {
    // const currentPrice = await this.#loader.currentPrice?.();
    const holdingOrders = await this.getHoldingOrders();
    // const coinAccount = await this.getCoinAccount();

    // if (!currentPrice || !coinAccount) return;
    if (!this.currentPrice || !holdingOrders) return;

    const validOrders = holdingOrders.filter(({ executed_volume, volume }) => {
      const _volume = Number(volume ?? 0) || Number(executed_volume ?? 0);
      return _volume > 0;
    });
    // const rates = validOrders.map(({ price }) => {
    //   const _price = Number(price);
    //   return (currentPrice - _price) / _price;
    // });
    // const priceBuy = Number(coinAccount.avg_buy_price);
    // const rate = (currentPrice - priceBuy) / priceBuy;
    const sellingList = validOrders
      .map((order) => {
        const { unit_price } = order;
        // const unitPrice = Number(price) / Number(executed_volume);
        const unitPrice = Number(unit_price);
        const rate = (this.currentPrice - unitPrice) / unitPrice;
        console.log(
          `[Seller] considering - priceBuy: ${unitPrice}, currentPrice: ${this.currentPrice} rate: ${rate}`
        );
        return { ...order, rate };
      })
      .filter(
        ({ rate }) => rate >= this.thresholdWin || rate <= this.thresholdLose
      );
    // const balance = coinAccount?.balance ? Number(coinAccount.balance) : null;

    return {
      holdingOrders,
      sellingList,
      // isOut: rate <= this.thresholdLose || rate >= this.thresholdWin,
      // rate,
      // balance,
      // sellingPrice: this.currentPrice,
    };
  }
  sell({ price, volume }) {
    if (price * volume < 5000) {
      logger.warn(`[Seller] 최소주문금액 이하: ${price}`);
      return null;
    }
    return this._makeOrder({
      price,
      volume,
    });
  }
  async sellAll() {
    const coinAccount = await this.getCoinAccount();
    // const currentPrice = await this.#loader.currentPrice?.();

    if (!coinAccount || !this.currentPrice) return;

    const coinBalance = Number(coinAccount.balance);
    const response = await this.sell({
      price: this.currentPrice,
      volume: coinBalance,
    });

    logger.log('SELL ALL: ', response?.data);
  }
  async getHoldingOrders() {
    const res = await getOrders({
      market: this.market,
      holding: true,
    });
    return res?.rows ?? null;
  }
  async getCoinAccount() {
    const response = await getAccounts();
    return response?.data?.length > 0
      ? response.data.find(
          ({ currency }) => currency === this.market.replace('KRW-', '')
        )
      : null;
  }
  async _makeOrder({ price, volume }) {
    const response = await postOrder({
      market: this.market,
      side: 'ask',
      ordType: this.orderType,
      price: this.orderType === 'limit' ? price : undefined,
      volume,
      timeInForce: this.timeInForce,
    });
    return response?.data ?? null;
  }
}

export default Seller;
