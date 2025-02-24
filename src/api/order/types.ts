import type { Fetcher } from '../../request';

export type GETAccount = Fetcher<
  {},
  {
    currency: string;
    balance: string;
    locked: string;
    avg_buy_price: string;
    avg_buy_price_modified: boolean;
    unit_currency: string;
  }
>;

export type GETOrderChance = Fetcher<
  {
    market: string;
  },
  {
    bid_fee: string; // NumberString
    ask_bid: string; // NumberString
    market: {
      id: string;
      name: string;
      order_types: string[];
      order_sides: string[];
      bid: {
        currency: string;
        price_unit: string;
        min_total: number;
      };
      ask: {};
    };
    ask_types: string[];
    bid_types: string[];
  }
>;

export type GETOrdersByIds = Fetcher<
  {
    uuids?: string[];
    identifiers?: string[];
  },
  {
    uuid: string;
    side: string;
    ord_type: string;
    price: NumberString;
    state: string;
    market: string;
    created_at: string;
    volume: NumberString;
    remaining_volume: NumberString;
    reserved_fee: NumberString;
    remaining_fee: NumberString;
    paid_fee: NumberString;
    locked: NumberString;
    executed_volume: NumberString;
    executed_funds: NumberString;
    trades_count: NumberString;
    time_in_force: string;
    identifier: string;
  }
>;

export type GETOrder = Fetcher<
  {
    uuid?: string;
    identifier?: string;
  },
  {
    uuid: string;
    side: string;
    ord_type: string;
    price: NumberString;
    state: string;
    market: string;
    created_at: string;
    volume: NumberString;
    remaining_volume: NumberString;
    reserved_fee: NumberString;
    remaining_fee: NumberString;
    paid_fee: NumberString;
    locked: NumberString;
    executed_volume: NumberString;
    trades_count: number;
    trades: {
      market: string;
      uuid: string;
      price: NumberString;
      funds: NumberString;
      side: string;
      created_at: string;
    };
    time_in_force: string;
    identifier: string;
  }
>;

export type GETOpenOrders = Fetcher<
  {
    market?: string;
    state?: string;
    states?: string[];
    page?: number;
    limit?: number;
    orderBy?: string;
  },
  {
    uuid: string;
    side: string;
    ord_type: string;
    price: NumberString;
    state: string;
    market: string;
    created_at: string;
    volume: NumberString;
    remaining_volume: NumberString;
    reserved_fee: NumberString;
    remaining_fee: NumberString;
    paid_fee: NumberString;
    locked: NumberString;
    executed_funds: NumberString;
    trades_count: number;
    time_in_force: string;
    identifier: string;
  }
>;

export type GETClosedOrders = Fetcher<
  {
    market?: string;
    state?: string;
    states?: string[];
    startTime?: string;
    endTime?: string;
    limit?: number;
    orderBy?: string;
  },
  {
    uuid: string;
    side: string;
    ord_type: string;
    price: NumberString;
    state: string;
    market: string;
    created_at: string;
    volumne: NumberString;
    remaining_volume: NumberString;
    reserved_fee: NumberString;
    remaining_fee: NumberString;
    paid_fee: NumberString;
    locked: NumberString;
    executed_volume: NumberString;
    executed_funds: NumberString;
    trades_count: number;
    time_in_force: string;
    identifier: string;
  }
>;

export type DELETEOrder = Fetcher<
  {
    uuid?: string;
    identifier?: string;
  },
  {
    uuid: string;
    side: string;
    ord_type: string;
    price: NumberString;
    state: string;
    market: string;
    created_at: string;
    volume: NumberString;
    remaining_volume: NumberString;
    reserved_fee: NumberString;
    remaining_fee: NumberString;
    paid_fee: NumberString;
    locked: NumberString;
    executed_volume: NumberString;
    trades_count: number;
    identifier: string;
  }
>;

export type DELETEOpenOrders = Fetcher<
  {
    cancelSide: string;
    pairs: string[];
    excludedPairs?: string[];
    quoteCurrencies?: string[];
    count?: number;
    orderBy?: string;
  },
  {
    success: {
      count: number;
      orders: {
        uuid: string;
        identifier?: string;
        market: string;
      }[];
    };
    failed: {
      count: number;
      orders: {
        uuid: string;
        identifier?: string;
        imarket: string;
      }[];
    };
  }
>;

export type DELETEOrdersOfUuids = Fetcher<
  {
    uuids?: string[];
    identifiers?: string[];
  },
  {
    success: {
      count: number;
      orders: {
        uuid: string;
        identifier?: string;
        market: string;
      }[];
    };
    failed: {
      count: number;
      orders: {
        uuid: string;
        identifier?: string;
        imarket: string;
      }[];
    };
  }
>;

export type POSTOrder = Fetcher<
  {
    market: string;
    side: 'bid' | 'ask';
    volume?: NumberString;
    price?: NumberString;
    ordType: string;
    identifier?: string;
    timeInForce?: 'ioc' | 'fok';
  },
  {
    uuid: string;
    side: string;
    ord_type: string;
    price: NumberString;
    state: string;
    market: string;
    created_at: string;
    volume: NumberString;
    remaining_volume: NumberString;
    reserved_fee: NumberString;
    remaining_fee: NumberString;
    paid_fee: NumberString;
    locked: NumberString;
    executed_volume: NumberString;
    trades_count: number;
    time_in_force?: string;
    idenfitier?: string;
  }
>;

export type POSTCancelAndNewOrder = Fetcher<
  {
    prevOrderUuid?: string;
    prevOrderIdentifier?: string;
    newOrdType: 'limit' | 'price' | 'market' | 'best';
    newVolume: NumberString | 'remaining_only';
    newPrice: NumberString;
    newIdentifier?: string;
    newTimeInForce?: 'ioc' | 'fok';
  },
  {
    uuid?: string;
    side: string;
    ord_type: string;
    price: NumberString;
    state: string;
    market: string;
    created_at: string;
    volume: NumberString;
    remaining_volume: NumberString;
    reserved_fee: NumberString;
    remaining_fee: NumberString;
    paid_fee: NumberString;
    locked: NumberString;
    executed_volume: NumberString;
    trades_count: number;
    time_in_force?: string;
    identifier?: string;
    new_order_uuid?: string;
    new_order_identifier?: string;
  }
>;
