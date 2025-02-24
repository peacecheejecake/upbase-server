import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
const _utc = dayjs.utc;

export { _utc as utc };

export default dayjs;
