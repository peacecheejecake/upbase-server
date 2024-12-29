import client from './client.js';
// import logger from '../utils/logger.js';
import { format } from './_utils.js';

export const addTicker = (data) => {
  // opening_price float,
  // high_price float,
  // low_price float,
  // trade_price float,
  // prev_closing_price float,
  // change varchar(5),
  // change_price float,
  // signed_change_price float,
  // change_rate float,
  // signed_change_rate float,
  // trade_volume float,
  // acc_trade_volume float,
  // acc_trade_volume_24h float,
  // acc_trade_price float,
  // acc_trade_price_24h float,
  // trade_date char(8),
  // trade_time char(8),
  // trade_timestamp int

  const { names, blanks, values } = format({
    ...data,
    market: data.code,
    code: undefined,
  });

  return client.query(
    `INSERT INTO orders_buy (${names}) VALUES (${blanks})`,
    values
  );
};

export const getTickers = ({ market, count = 1e10 }) => {
  return client.query(
    'SELECT * FROM tickers WHERE market = $1 ORDER BT timestamp DESC LIMIT $2',
    [market, count]
  );
};
