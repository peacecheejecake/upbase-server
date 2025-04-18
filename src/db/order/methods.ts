import logger from '@/utils/logger';
import client from '../client';
import { format } from '../_utils';
import type {
  GetOrders,
  DeleteOrder,
  ModifyOrderHoldingState,
  AddOrder,
} from './types';

export const getOrders: GetOrders = (query = {}) => {
  // const select = 'SELECT * FROM orders_buy';

  const conditionEntries = Object.entries(query).filter(
    ([_, value]) => value !== undefined
  );
  if (conditionEntries.length === 0)
    return client.query('SELECT * FROM orders_buy');

  const conditionQuery = conditionEntries
    .map(([key, _], i) => `${key} = $${i + 1}`)
    .join(' AND ');
  const conditionValues = conditionEntries.map(([_, value]) => value);

  return client.query(
    `SELECT * FROM orders_buy WHERE ${conditionQuery}`,
    conditionValues
  );
  // const queryConditions = conditions.map((_, i) => `AND $${i + 1}`).join(' ');

  // if (!market) return client.query('SELECT * FROM orders_buy');

  // return client.query('SELECT * FROM orders_buy WHERE market = $1 AND', [
  //   market,
  // ]);
};

export const deleteOrder: DeleteOrder = ({ uuid }) => {
  logger.debug(`[DB - deleteOrder] uuid: ${uuid}`);
  return client.query('DELETE FROM orders_buy WHERE uuid = $1', [uuid]);
};

export const modifyOrderHoldingState: ModifyOrderHoldingState = ({
  uuid,
  holding = false,
}) => {
  return client.query('UPDATE orders_buy SET holding = $2 WHERE uuid = $1', [
    uuid,
    holding,
  ]);
};

export const addOrder: AddOrder = (data) => {
  /*
  {
    uuid,
    ord_type,
    price,
    state,
    market,
    createdAt,
    volume,
    remaining_volume,
    reserved_fee,
    remaining_fee,
    paid_fee,
    locked,
    executed_volume,
    excuted_funds,
    trades_count,
    time_in_force,
    identifier,
    holding,
    unit_price
  } 
  */
  // const keys = Object.keys(data);
  // const columnNames = keys.join(', ');
  // const columnBlanks = keys.map((_, i) => `$${i + 1}`).join(', ');

  // const values = Object.values(data);
  const { names, blanks, values } = format(data);

  return client.query(
    `INSERT INTO orders_buy (${names}) VALUES (${blanks})`,
    values
  );
};
