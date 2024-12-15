import App from './app';

const app = new App();

app.init({ market: 'KRW-IOTA', intervalBuy: 5, intervalSell: 5 });

// import {
//   getAccounts,
//   getOrderChance,
//   getClosedOrders,
//   getCandles,
//   getWithdrawsChance,
// } from './api';
// import { formatDatetime } from './utils';
// // import client from './db/client';

// import { addOrder, getOrders, deleteOrder } from './db/order';

// // client.query('SELECT NOW()', (err, res) => {
// //   console.log(err, res);
// //   client.end();
// // });

// (async () => {
//   // const res = await addOrder({
//   //   uuid: 'e5715c44-2d1a-41e6-91d8-afa579e28731',
//   //   ord_type: 'limit',
//   //   price: '103813000',
//   //   state: 'done',
//   //   market: 'KRW-BTC',
//   //   created_at: '2024-06-13T10:28:36+09:00',
//   //   volume: '0.00039132',
//   //   remaining_volume: '0',
//   //   reserved_fee: '0',
//   //   remaining_fee: '0',
//   //   paid_fee: '20.44627434',
//   //   locked: '0',
//   //   executed_volume: '0.00039132',
//   //   executed_funds: '40892.54868',
//   //   trades_count: 2,
//   //   holding: true,
//   // });
//   const res = await deleteOrder({
//     uuid: 'e5715c44-2d1a-41e6-91d8-afa579e28731',
//   });

//   console.log(res);
//   // client.end();
// })();

// // getAccounts().then((response) => {
// //   console.log(response.data);
// // });

// // getOrderChance({ market: 'KRW-IOTA' }).then((response) => {
// //   console.log(response.data);
// // });

// // getClosedOrders({
// //   market: 'KRW-IOTA',
// //   state: 'done',
// //   limit: 10,
// //   orderBy: 'desc',
// // }).then((response) => {
// //   console.log(response.data);
// // });

// // getCandles({ unit: 'minutes', market: 'KRW-XRP', count: 60 }).then(
// //   (response) => {
// //     console.log(response);
// //   }
// // );

// // getWithdrawsChance().then((response) => {
// //   console.log(response.data);
// // });
