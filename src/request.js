import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import jsonwebtoken from 'jsonwebtoken';
import crypto from 'crypto';
import querystring from 'querystring';

import env from './env';
import { filterEmptyValues, flatternArrayValues } from './utils';
import logger from './utils/logger';

const jwtToken = (body = {}, { encode = true } = {}) => {
  const _body = body;
  const query = encode
    ? querystring.encode(_body)
    : new URLSearchParams(_body).toString();
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
  config.headers.Authorization = `Bearer ${jwtToken(config.params ?? {})}`;
  logger.debug(
    `[API - request] ${config.method} ${config.url} ${JSON.stringify(config.params)}`
  );
  return config;
});

_axios.interceptors.response.use(
  (response) => {
    logger.debug(
      `[API - response Success] ${response.config.method} ${response.config.url}`
    );
    return response;
  },
  (error) => {
    logger.error(
      `[API - response Error] ${error.config.method} ${error.config.url} ${JSON.stringify(error.response.data)}`
    );
    // return Promise.reject(error);
    return error;
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
