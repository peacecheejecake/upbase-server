import logger from './utils/logger';
import Trader from './trader';
import { getClosedOrders, getOpenOrders, getOrdersByIds } from './api';
import { addOrder, getOrders } from './db/order.js';
import { sum } from './utils';
import { getAccounts } from './api/order.js';

class App {
  #trader;

  constructor() {}
  async init({ market, intervalBuy, intervalSell }) {
    this.#trader = new Trader({
      market,
      intervalBuy,
      intervalSell,
    });

    // getClosedOrders({ orderBy: 'asc' }).then((response) => {
    //   console.log('getOrders', response.data);
    // });

    // getAccounts().then((response) => {
    //   console.log('getAccounts', response.data);
    // });

    this.#trader.start({ immediate: true });
    // const res = await getOrders({ market: 'KRW-IOTA' });
    // console.log(
    //   sum(...res.rows.map(({ executed_volume }) => Number(executed_volume)))
    // );
    // getOrdersByIds({ uuids: ['20a081cb-7be7-4510-99a2-fdd2153a9fb5'] }).then(
    //   (response) => {
    //     console.log('getOrdersByIds', response.data);
    //   }
    // );

    // this.#trader.seller.sellAll();
    // this.testCurrentPrice();
  }
  // async testCurrentPrice() {
  //   const response = await getCandles({
  //     unit: 'seconds',
  //     market: this.market,
  //     count: 1,
  //   });

  //   if (!response?.data?.length) return null;

  //   console.log('----', response.data);

  //   // const median = average(currentPrice.high_price, currentPrice.low_price);
  //   // return median;
  // }
}

export default App;
