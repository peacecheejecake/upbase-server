import { TickerData } from '@/socket/TickerSocket';
import type { QueryMethod } from '../client';

export type AddTicker = QueryMethod<TickerData, any>;
export type GetTickers = QueryMethod<
	{
		market: string;
		count: number;
	},
	any
>
