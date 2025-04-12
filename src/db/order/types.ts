import type { QueryMethod } from "../client";
import { HistorySecondTable, OrdersBuyTable } from "../types";

export type GetOrders = QueryMethod<
	Partial<HistorySecondTable>,
	HistorySecondTable
>

export type DeleteOrder = QueryMethod<
	{ uuid: string },
	OrdersBuyTable
>

export type ModifyOrderHoldingState = QueryMethod<
	{
		uuid: string;
		holding?: boolean;
	},
	OrdersBuyTable
>

export type AddOrder = QueryMethod<
	OrdersBuyTable,
	OrdersBuyTable
>
