import client from '../client';
import { format } from '../_utils';
import { AddTicker, GetTickers } from './types';

export const addTicker: AddTicker = (data) => {
  const { names, blanks, values } = format({
    ...data,
    market: data.code,
    code: undefined,
  });

  return client.query(
    `INSERT INTO tickers (${names}) VALUES (${blanks})`,
    values
  );
};

export const getTickers: GetTickers = ({ market, count = 1e10 }) => {
  return client.query(
    'SELECT * FROM tickers WHERE market = $1 ORDER BT timestamp DESC LIMIT $2',
    [market, count]
  );
};
