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

          const { uuid, ask_bid, state, executed_volume } = order;

          if (executed_volume > 0 && (state === 'done' || state === 'cancel')) {
            // if (ask_bid === 'BID') {
            // logger.debug(`[MyOrderSocket] addOrder - ${uuid}`);
            // } else if (ask_bid === 'ASK') {
            // modifyOrderHoldingState({ uuid, holding: false });
            // logger.debug(`[MyOrderSocket] modifyOrderHoldingState - ${uuid}`);
            // }
            logger.debug(
              `[MyOrderSocket] closed - ${ask_bid}, ${state}, ${uuid}`
            );
            this.addOrderToDatabase(order);
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
    } = order;
    const _price = avg_price;

    addOrder({
      // ...orders,
      side: ask_bid.toLowerCase(),
      uuid,
      ord_type: order_type,
      price: _price,
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
      unit_price:
        order_type === 'price' ? Number(_price) / executed_volume : price,
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
