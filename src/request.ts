import axios, { type AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import jsonwebtoken from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as querystring from 'querystring';

import env from './env';
import { filterEmptyValues, flatternArrayValues } from './utils';
import logger from './utils/logger';

interface Body {
  [key: string]:
    | string
    | number
    | boolean
    | readonly string[]
    | readonly number[]
    | readonly boolean[]
    | null
    | undefined;
}

const jwtToken = (body: Body = {}) => {
  const _isArray = ([key, _]) => key.includes('[]');

  const arrayQuery = Object.entries(body)
    .filter(_isArray)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  const noneArrayQuery = querystring.encode(
    Object.fromEntries(
      Object.entries(body).filter(([key, _]) => !_isArray([key, _]))
    )
  );
  const query =
    arrayQuery + (arrayQuery && noneArrayQuery ? '&' : '') + noneArrayQuery;
  const queryHash = crypto
    .createHash('sha512')
    .update(query, 'utf-8') // todo: encode or not(array)
    .digest('hex');

  const payload = {
    access_key: env.ACCESS_KEY,
    nonce: uuidv4(),
    query_hash: queryHash,
    query_hash_alg: 'SHA512',
  };

  return jsonwebtoken.sign(payload, env.SECRET_KEY);
};

const _axios = axios.create({
  baseURL: env.BASE_URL,
  timeout: 30000,
});

_axios.interceptors.request.use((config) => {
  config.params = flatternArrayValues(filterEmptyValues(config.params ?? {}));
  config.headers.Authorization = `Bearer ${jwtToken(config.params)}`;
  // logger.log(
  //   'verbose',
  //   `[API - request] ${config.method} ${config.url} ${JSON.stringify(config.params)}`
  // );
  return config;
});

_axios.interceptors.response.use(
  (response) => {
    // logger.log(
    //   'verbose',
    //   `[API - response Success] ${response.config.method} ${response.config.url}`
    // );
    return response;
  },
  (error) => {
    logger.error(
      `[API - response Error] ${error.config?.method} ${error.config?.url} ${JSON.stringify(error.config?.params)} ${JSON.stringify(error.response?.data)}`
    );
    // return Promise.reject(error);
    return error.response;
  }
);

// const request = {
//   get: (url, config = {}) => {
//     return _axios.get(url, config);
//   },
//   post: (url, data) => _axios.post(url, data),
//   delete: (url, config) => _axios.delete(url, config),
// };

export default _axios;

export type Response<T> = AxiosResponse<T>;
export type Fetcher<Q extends object, S extends object> = (
  params?: Q
) => Promise<Response<S>>;
