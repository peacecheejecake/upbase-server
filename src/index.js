import { getAccounts, getOrderChance, getClosedOrders } from './api';

// getAccounts().then((response) => {
//   console.log(response.data);
// });

getOrderChance({ market: 'KRW-IOTA' }).then((response) => {
  console.log(response.data);
});

// getClosedOrders({
//   market: 'KRW-IOTA',
//   state: 'done',
//   limit: 10,
//   orderBy: 'desc',
// }).then((response) => {
//   console.log(response.data);
// });
