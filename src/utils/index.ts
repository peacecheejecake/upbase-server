import dayjs, { utc, type Dayjs } from './dayjs';

export const average = (...nums: number[]) => {
  return (
    nums.reduce((acc, cur) => acc + cur, 0) as number
    / nums.length
  );
};

export const sum = (...nums: number[]) => {
  return nums.reduce((acc, cur) => acc + cur, 0);
};

export const formatDatetime = (datetime?: string | Dayjs) => {
  const _datetime = dayjs(datetime);
  if (!_datetime.isValid()) return null;
  return new utc(_datetime).local().format();
};

export const filterEmptyValues = (obj: object) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
};

export const flatternArrayValues = (obj: object) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const elm = Array.isArray(value)
      ? Object.fromEntries(value.map((v) => [`${key}[]`, v]))
      : { [key]: value };
    return {
      ...acc,
      ...elm,
    };
  }, {});
  // return Object.fromEntries(
  //   Object.entries(obj).map(([key, value]) => {
  //     const _key = Array.isArray(value) ? `${key}[]` : key;
  //     return [_key, value];
  //   })
  // );
};
