import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import jsonwebtoken from 'jsonwebtoken';
import crypto from 'crypto';
import querystring from 'querystring';

import env from './env';
import { filterEmptyValues } from './utils';
import logger from './utils/logger';

const jwtToken = (body = {}) => {
  const _body = filterEmptyValues(body);
  const query = querystring.encode(_body);
  const queryHash = crypto
    .createHash('sha512')
    .update(query, 'utf-8')
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
  config.params = filterEmptyValues(config.params ?? {});
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
      '[API - response Error] ' + JSON.stringify(error.response.data)
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
