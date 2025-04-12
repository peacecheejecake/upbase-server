// import type TickerSocket from "@/socket/TickerSocket";

// export interface PriceItem {
// 	timestamp: number;
// 	trade_price: number;
// }

// export abstract class PriceProviderAbstract {
//   #stride: number;
//   #socket: TickerSocket;
//   #storage: PriceItem[];
//   #isCollectingFirstStride: boolean;
//   #timerGarbageCollection: boolean;

//   abstract market: string;

//   abstract itemsCompared: PriceItem | undefined;

//   abstract initialize({ onChange });
// }