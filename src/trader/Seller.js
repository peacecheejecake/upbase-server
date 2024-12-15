import dayjs from 'dayjs';
import { sum } from '../utils';
import logger from '../utils/logger';
import { getOrders, modifyOrderHoldingState } from '../db/order';
import { postOrder, getAccounts } from '../api';
import { COMMISION_RATE } from './constants';

class Seller {
  #timer;
  #loader;
  // #buyer;

  constructor({
    market,
    loader,
    // buyer,
    thresholdWin = 0.005,
    thresholdLose = -0.02,
    interval = 60,
    periodLimit = null,
  }) {
    this.market = market;

    this.#loader = loader;
    // this.#buyer = buyer;

    this.thresholdWin = thresholdWin;
    this.thresholdLose = thresholdLose;
    this.interval = interval;
    this.periodLimit = periodLimit;
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
    logger.debug(`[Seller] START`);
    // const { rates, holdingOrders, sellingList, sellingPrice } =
    //   (await this.consider()) ?? {};
    const { rate, sellingPrice, isOut, balance } =
      (await this.consider()) ?? {};

    // if (!sellingList?.length || !sellingPrice) {
    if (!isOut) {
      logger.debug(`[Seller] CANCEL:`, {
        // rates: JSON.stringify(rates),
        // holdingOrders: holdingOrders.length,
        // sellingList: sellingList.length,
        rate,
        sellingPrice,
      });
      return;
    }

    // const volume = sum(sellingList.map(({ volume }) => Number(volume)));
    const volume = balance;
    const data = await this.sell({
      price: sellingPrice,
      volume,
    });
    const { uuid } = data ?? {};

    if (uuid) {
      logger.info(`SELL[${this.market}]: ${sellingPrice}, ${volume}`);
      // sellingList.forEach(async ({ uuid }) => {
      //   try {
      //     const { rowCount } = await modifyOrderHoldingState({
      //       uuid,
      //       holding: false,
      //     });

      //     if (rowCount !== sellingList.length) {
      //       logger.warn(
      //         `Try to sell ${sellingList.length}, but ${rowCount} done`
      //       );
      //     }
      //   } catch (e) {
      //     logger.error('Error on modifyOrderHoldingState: ', e);
      //   }
      // });

      //todo: check until closed
      // this.checkUntilClosed({uuid});
    }
  }
  async consider() {
    const currentPrice = await this.#loader.currentPrice?.();
    const holdingOrders = await this.getHoldingOrders();
    const coinAccount = await this.getCoinAccount();

    if (!currentPrice || !coinAccount) return;
    // if (!currentPrice || !holdingOrders) return;

    // const rates = holdingOrders.map(({ price }) => {
    //   const _price = Number(price);
    //   return (currentPrice - _price) / _price;
    // });
    const priceBuy = Number(coinAccount.avg_buy_price);
    const rate = (currentPrice - priceBuy) / priceBuy;
    // const sellingList = rates.filter(
    //   (rate) => rate <= this.thresholdLose || rate >= this.thresholdWin
    // );

    return {
      holdingOrders,
      // rates,
      // sellingList,
      isOut: rate <= this.thresholdLose || rate >= this.thresholdWin,
      rate,
      balance: Number(coinAccount.balance),
      sellingPrice: currentPrice,
    };
  }
  async sellAll() {
    const coinAccount = await this.getCoinAccount();
    const currentPrice = await this.#loader.currentPrice?.();

    if (!coinAccount || !currentPrice) return;

    const coinBalance = Number(coinAccount.balance);
    const response = await this.sell({
      // price: currentPrice,
      volume: coinBalance,
    });

    logger.log('SELL ALL: ', response?.data);
  }
  sell({ price, volume }) {
    return this._makeOrder({ volume });
  }
  async checkUntilClosed({ uuid }) {
    //todo: check until closed
    const timer = setInerval(async () => {});
    // let isClosed = false;
    // while (!isClosed) {
    //   const holdingOrders = await this.getHoldingOrders();

    //   isClosed = !holdingOrders.some(({ uuid: u }) => u === uuid);
    // }
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
      ordTyep: 'market',
      // price,
      volume,
    });
    return response?.data ?? null;
  }
}

export default Seller;
