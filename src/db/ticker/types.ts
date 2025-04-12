import { TickerData } from '@/socket/TickerSocket';
import type { QueryMethod } from '../client';
import type { TickersTable } from '../types';

export type AddTicker = QueryMethod<TickerData, TickersTable>;
export type GetTickers = QueryMethod<
	{
		market: string;
		count: number;
	},
	TickersTable
>
