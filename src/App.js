import logger from './utils/logger';
import Trader from './trader';
import { getClosedOrders, getOpenOrders, getOrdersByIds } from './api';
import { addOrder } from './db/order.js';

class App {
  #trader;

  constructor() {}
  init({ market, intervalBuy, intervalSell }) {
    this.#trader = new Trader({
      market,
      intervalBuy,
      intervalSell,
    });

    // getClosedOrders({ orderBy: 'asc' }).then((response) => {
    //   console.log('getOrders', response.data);
    // });

    this.#trader.start({ immediate: true });

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
