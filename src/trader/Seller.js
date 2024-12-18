import dayjs from 'dayjs';
import { sum } from '../utils';
import logger from '../utils/logger';
import { getOrders, deleteOrder, modifyOrderHoldingState } from '../db/order';
import { postOrder, getAccounts, getOrdersByIds } from '../api';
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
    const { holdingOrders, sellingList, sellingPrice, balance } =
      (await this.consider()) ?? {};
    // const { rate, sellingPrice, isOut, balance } =
    //   (await this.consider()) ?? {};

    if (!sellingList?.length || !sellingPrice) {
      // if (!isOut) {
      logger.debug(`[Seller] CANCEL:`, {
        // rates: JSON.stringify(rates),
        holdingOrders: holdingOrders.length,
        sellingList: sellingList.length,
        // rate,
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
            price: sellingPrice,
            volume: balance === null ? volume : Math.min(balance, volume),
          })) ?? {};

        if (error?.name === 'insufficient_funds_ask') {
          volumeNotSold += volume;
          // deleteOrder({ uuid });
          modifyOrderHoldingState({ uuid: uuidBuy, holding: false });
          return;
        }

        if (!uuidSell) return;

        // const rate = (sellingPrice - price) / price;

        logger.info(
          `[Seller] SELL - price(sell): ${sellingPrice}, price(buy): ${price}, rate: ${rate}, volume: ${volume}`
        );

        this.checkUntilClosed({ uuid: uuidBuy });
      }
    );

    setTimeout(async () => {
      const balance = (await this.getCoinAccount())?.balance;

      if (volumeNotSold > 0 && balance > 0) {
        logger.info(`[Seller] Try to sell not sold: ${volumeNotSold}`);

        const { uuid } = await this.sell({
          price: sellingPrice,
          volume: Math.min(balance, volumeNotSold),
        });

        if (uuid) {
          logger.info(
            `[Seller] SELL - price: ${sellingList}, volume: ${volumeNotSold}`
          );
        }
      }
    }, 1000);

    // const volume = sum(
    //   ...sellingList.map(
    //     ({ volume, executed_volume }) =>
    //       Number(volume ?? 0) || Number(executed_volume ?? 0)
    //   )
    // );
    // // const volume = balance;
    // const data = await this.sell({
    //   // price: sellingPrice,
    //   volume: balance === null ? volume : Math.min(balance, volume),
    // });
    // const { uuid } = data ?? {};

    // if (uuid) {
    //   const rate = (sellingPrice - price) / price;
    //   logger.info(
    //     `[Seller] SELL[${this.market}]: price: ${sellingPrice}, volume: ${volume}, rate: ${rate}`
    //   );
    //   // sellingList.forEach(async ({ uuid }) => {
    //   //   try {
    //   //     const { rowCount } = await modifyOrderHoldingState({
    //   //       uuid,
    //   //       holding: false,
    //   //     });

    //   //     if (rowCount !== sellingList.length) {
    //   //       logger.warn(
    //   //         `Try to sell ${sellingList.length}, but ${rowCount} done`
    //   //       );
    //   //     }
    //   //   } catch (e) {
    //   //     logger.error('Error on modifyOrderHoldingState: ', e);
    //   //   }
    //   // });

    //   this.checkUntilClosed({ uuid });
    // }
  }
  async consider() {
    const currentPrice = await this.#loader.currentPrice?.();
    const holdingOrders = await this.getHoldingOrders();
    const coinAccount = await this.getCoinAccount();

    // if (!currentPrice || !coinAccount) return;
    if (!currentPrice || !holdingOrders) return;

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
        const { price } = order;
        // const unitPrice = Number(price) / Number(executed_volume);
        const unitPrice = Number(price);
        const rate = (currentPrice - unitPrice) / unitPrice;
        return { ...order, rate };
      })
      .filter(
        ({ rate }) => rate >= this.thresholdWin || rate <= this.thresholdLose
      );
    const balance = coinAccount?.balance ? Number(coinAccount.balance) : null;

    return {
      holdingOrders,
      sellingList,
      // isOut: rate <= this.thresholdLose || rate >= this.thresholdWin,
      // rate,
      balance,
      sellingPrice: currentPrice,
    };
  }
  sell({ price, volume }) {
    if (price * volume < 5000) {
      logger.warn(`[Seller] 최소주문금액 이하: ${price}`);
      return null;
    }
    return this._makeOrder({ price, volume });
  }
  async sellAll() {
    const coinAccount = await this.getCoinAccount();
    const currentPrice = await this.#loader.currentPrice?.();

    if (!coinAccount || !currentPrice) return;

    const coinBalance = Number(coinAccount.balance);
    const response = await this.sell({
      price: currentPrice,
      volume: coinBalance,
    });

    logger.log('SELL ALL: ', response?.data);
  }
  async checkUntilClosed({ uuid }) {
    logger.debug(`[Seller] checkOrderUntilClosed START: ${uuid}`);
    const timer = setInterval(async () => {
      const response = await getOrdersByIds({ uuids: [uuid] });
      const order = (response?.data ?? []).find(
        ({ uuid: _uuid, side }) => _uuid === uuid && side == 'ask'
      );

      if (!order) return;

      if (order.state === 'done' || order.state === 'cancel') {
        // modifyOrderHoldingState({ uuid, holdiang: true });
        // const _volume = Number(order.executed_volume ?? 0);
        deleteOrder({ uuid });

        clearInterval(timer);
        logger.info(`[Seller] checkOrderUntilClosed CLOSED: ${uuid}`);
      }
    }, 30000);
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
      ordType: 'limit',
      price,
      volume,
    });
    return response?.data ?? null;
  }
}

export default Seller;
