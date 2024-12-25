import dayjs from 'dayjs';
import Socket from './base/Socket.js';
import logger from '../utils/logger.js';
import { addOrder } from '../db/order.js';

class MyOrderSocket extends Socket {
  // #orders = [];

  constructor({ lazyInit = false } = {}) {
    super({
      requestData: [
        { ticket: 'my-order' },
        { type: 'myOrder' },
        { format: 'DEFAULT' },
      ],
      lazyInit,
      isPrivate: true,
      onMessage: (data) => {
        try {
          const order = JSON.parse(data.toString());
          if (!order?.uuid) return;
          // this.#orders = orders;

          const {
            uuid,
            ask_bid,
            order_type,
            state,
            executed_volume,
            executed_funds,
            paid_fee,
            price,
            avg_price,
          } = order;
          const _volume = (() => {
            if (order_type === 'limit') return Number(executed_volume);

            return (
              (Number(executed_funds) + Number(paid_fee)) / Number(avg_price)
            );
          })();
          const _price = (() => {
            if (order_type === 'limit') return Number(avg_price);

            return ask_bid === 'ASK'
              ? Number(avg_price) + Number(paid_fee) / Number(executed_volume)
              : Number(price) / _volume;
          })();

          logger.verbose(`[MyOrderSocket] ${JSON.stringify(order)}`);

          if (_volume > 0 && (state === 'done' || state === 'cancel')) {
            // if (ask_bid === 'BID') {
            // logger.debug(`[MyOrderSocket] addOrder - ${uuid}`);
            // } else if (ask_bid === 'ASK') {
            // modifyOrderHoldingState({ uuid, holding: false });
            // logger.debug(`[MyOrderSocket] modifyOrderHoldingState - ${uuid}`);
            // }
            logger.debug(
              `[MyOrderSocket] closed - ${ask_bid}, ${state}, ${uuid}, ${_price}`
            );
            this.addOrderToDatabase({
              ...order,
              price: _price,
              unit_price: _price,
              volume: _volume,
              executed_volume: _volume,
            });
          }
        } catch (error) {
          logger.error('[MyOrderSocket] error', error);
        }
      },
    });
  }
  addOrderToDatabase(order) {
    const {
      type,
      code,
      uuid,
      ask_bid,
      order_type,
      state,
      trade_uuid,
      price,
      avg_price,
      volume,
      remaining_volume,
      executed_volume,
      trades_count,
      reserved_fee,
      remaining_fee,
      paid_fee,
      locked,
      executed_funds,
      time_in_force,
      trade_fee,
      is_marker,
      identifier,
      trade_timestamp,
      order_timestamp,
      timestamp,
      unit_price,
    } = order;
    // const _price = avg_price;

    addOrder({
      // ...orders,
      side: ask_bid.toLowerCase(),
      uuid,
      ord_type: order_type,
      price,
      state,
      market: code,
      created_at: dayjs(new Date(timestamp)).format('YYYY-MM-DD HH:mm:ss'),
      volume,
      remaining_volume,
      reserved_fee,
      remaining_fee,
      paid_fee,
      locked,
      executed_volume,
      executed_funds,
      trades_count,
      time_in_force,
      identifier,
      holding: ask_bid === 'BID',
      unit_price,
    });
  }
  // clearOrders() {
  //   this.#orders = [];
  // }
  // orders() {
  //   return this.#orders;
  // }
}

export default MyOrderSocket;
