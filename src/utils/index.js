import dayjs, { utc } from './dayjs';

export const average = (...nums) => {
  return nums.reduce((acc, cur) => acc + Number(cur), 0) / nums.length;
};

export const sum = (...nums) => {
  return nums.reduce((acc, cur) => acc + Number(cur), 0);
};

export const formatDatetime = (datetime) => {
  const _datetime = new dayjs(datetime);
  if (!_datetime.isValid()) return null;
  return new utc(_datetime).local().format();
};

export const filterEmptyValues = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
};

export const flatternArrayValues = (obj) => {
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
