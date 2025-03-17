import client from '../client';
import type {
  AddSecondCandle,
  GetSecondCandle,
  GETRecentSecondeCandles,
} from './types';

export const addSecondCandle: AddSecondCandle = (data) => {
  /*
    market,
    candle_date_time_utc,
    candle_date_time_kst,
    opening_price,
    high_price,
    low_price,
    trade_price,
    timestamp,
    candle_acc_trade_price,
    candle_acc_trade_volume,
  */

  try {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const valueBlanks = values.map((_, i) => `$${i + 1}`).join(', ');

    return client.query(
      `INSERT INTO history_second (${keys.join(', ')}) VALUES (${valueBlanks})`,
      values
    );
  } catch (error) {
    console.error('addSecondCandle', error);
  }
};

export const getSecondCandle: GetSecondCandle = ({
  market,
  candle_date_time_kst,
}) => {
  try {
    return client.query(
      `
        SELECT * 
        FROM history_second
        WHERE
          market = $1 AND
          candle_date_time_kst = $2
      `,
      [market, candle_date_time_kst]
    );
  } catch (error) {
    console.error('getSecondCandle', error);
  }
};

export const getRecentSecondCandles: GETRecentSecondeCandles = ({
  market,
  count,
}) => {
  try {
    return client.query(
      `
        SELECT * 
        FROM history_second
        WHERE
          market = $1
        ORDER BY candle_date_time_kst DESC
        LIMIT $2
      `,
      [market, count]
    );
  } catch (error) {
    console.error('getRecnetSecondCandles', error);
  }
};
