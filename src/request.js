import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import jsonwebtoken from 'jsonwebtoken';
import crypto from 'crypto';
import querystring from 'querystring';

import env from './env';

const jwtToken = (body = {}) => {
  const _body = Object.entries(body)
    .filter(([key, value]) => value !== undefined)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
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
  // headers: { Authorization: `Bearer ${jwtToken()}` },
});

_axios.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${jwtToken(config.params)}`;
  return config;
});

// const request = {
//   get: (url, config = {}) => {
//     return _axios.get(url, config);
//   },
//   post: (url, data) => _axios.post(url, data),
//   delete: (url, config) => _axios.delete(url, config),
// };

export default _axios;
