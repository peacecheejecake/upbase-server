import { QueryMethod } from "../client";
import { HistorySecondTable } from "../types";

export type AddSecondCandle = QueryMethod<
	Partial<HistorySecondTable>,
	HistorySecondTable
>

export type GetSecondCandle = QueryMethod<
	{
		market: string;
		candle_date_time_kst: string;
	},
	HistorySecondTable
>;

export type GETRecentSecondeCandles = QueryMethod<
	{
		market: string;
		count: number;
	},
	HistorySecondTable
>
