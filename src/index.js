import { processArguments } from "./utils/process.js";
import logger from "./utils/logger.js";
import App from './App.js';

const app = new App();
const args = processArguments();

logger.info(args);

app.init({ 
	market: args.market ?? 'KRW-IOTA', 
	intervalBuy: args.interval ? Number(args.interval) : 5, 
	intervalSell: args.interval ? Number(args.interval) : 5,
	thresholdBuy: args['t-buy'] ? Number(args['t-buy']) : undefined,
	thresholdSellWin: args['t-sell-win'] ? Number(args['t-sell-win']) : undefined,
	thresholdSellLose: args['t-sell-lose'] ? Number(args['t-sell-lose']) : undefined,
});
