import dayjs from 'dayjs';
import { formatDatetime } from '../utils/index.js';
import { getCandles } from '../api/quotation.js';
import { addSecondCandle, getSecondCandle } from '../db/candle.js';

class CandleFetcher {
  constructor({ market }) {
    // this.unit = unit;
    this.market = market;
  }
  async fetch({ to = '', count }) {
    for (let i = 0; i < Math.ceil(count / 200); i++) {}
    const response = await getCandles({
      // unit: this.unit,
      unit: 'seconds',
      market: this.market,
      to,
      count,
    });

    if (!response?.data?.length) return null;

    return response.data;
  }
  async batch({ to, count }) {
    const _to = dayjs(to ?? new Date());
    const _length = Math.ceil(count / 200);

    let i = 0;
    const _once = async () => {
      const data = await this.fetch({
        to: formatDatetime(_to.subtract(i * 200, 'seconds')),
        count: i === _length - 1 ? count % 200 : 200,
      });

      data && this.toDatabase(data);
      i += 1;
    };

    await _once();

    let timer = setInterval(() => {
      if (i >= _length) {
        clearInterval(timer);
        return;
      }

      _once();
    }, 1000);
  }
  toDatabase(candles) {
    candles.forEach(async (candle) => {
      const savedCandles = await getSecondCandle({
        market: this.market,
        candle_date_time_kst: candle.candle_date_time_kst,
      });

      if (savedCandles?.rows?.length > 0) return;

      await addSecondCandle(candle);
    });
  }
}

export default CandleFetcher;
