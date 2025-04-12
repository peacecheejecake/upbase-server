import dayjs from 'dayjs';
import Socket from './base/Socket';
import logger from '../utils/logger';
import { addOrder } from '../db/order';

interface MyOrderDataFullHand {
  type: 'myOrder';
  code: string;
  uuid: string;
  ask_bid: 'ASK' | 'BID';
  order_type: 'limit' | 'price' | 'market' | 'best';
  state: 'wait' | 'watch' | 'trade' | 'done' | 'cancel';
  trade_uuid: string;
  price: number;
  avg_price: number;
  volume: number;
  remaining_volume: number;
  executed_volume: number;
  trades_count: number;
  reserved_fee: number;
  remaining_fee: number;
  paid_fee: number;
  locked: number;
  executed_funds: number;
  time_in_force: 'ioc' | 'fok';
  trade_fee: number;
  is_maker: boolean;
  identifier: string;
  trade_timestamp: number;
  order_timestamp: number;
  timestamp: number;
  stream_type: string;
}

type MyOrderData = MyOrderDataFullHand;

interface MyOrderSocketConstructorOptions {
  lazyInit?: boolean;
}

class MyOrderSocket extends Socket {
  // #orders = [];

  constructor({ lazyInit = false }: MyOrderSocketConstructorOptions) {
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
          const order = JSON.parse(data.toString()) as MyOrderData;
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

          if (state === 'done' || state === 'cancel') {
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
  addOrderToDatabase(order: MyOrderData) {
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
      is_maker,
      identifier,
      trade_timestamp,
      order_timestamp,
      timestamp,
      // unit_price,
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
      unit_price: price,
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
