import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
const _utc = dayjs.utc;

export { _utc as utc };
export type { Dayjs };

export default dayjs;
