import WebSocket, { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import env from '@/env.js';
import logger from '@/utils/logger.js';

function jwtToken() {
  const payload = {
    access_key: env.ACCESS_KEY,
    nonce: uuidv4(),
  };

  return jwt.sign(payload, env.SECRET_KEY);
}

class Socket {
  #ws: WebSocket;
  #requestData: object;
  #pingTimer: NodeJS.Timeout;
  #isPrivate: boolean = false;

  #onError?: (error) => void;
  #onMessage;
  #onUpgrade;

  constructor({
    requestData,
    isPrivate = false,
    lazyInit = false,
    // onOpen = () => {},
    onError = (error) => {
      logger.error(error);
    },
    onMessage = (data) => {
      logger.debug(data);
    },
    onUpgrade = null,
  }) {
    this.#isPrivate = isPrivate;
    this.#requestData = requestData;
    this.#onError = onError;
    this.#onMessage = onMessage;
    this.#onUpgrade = onUpgrade;

    if (!lazyInit) {
      this.start();
    }
  }
  get baseUrl() {
    return `${env.BASE_URL_WS}${this.#isPrivate ? '/private' : ''}`;
  }
  get socketOptions() {
    return this.#isPrivate
      ? {
          headers: { authorization: `Bearer ${jwtToken()}` },
        }
      : {};
  }
  start({ onMessage = null } = {}) {
    onMessage && (this.#onMessage = onMessage);

    this.#ws = new WebSocket(this.baseUrl, this.socketOptions);

    this.#ws.on('open', () => {
      // this.#ws.send(JSON.stringify(this.#requestData));
      this.sendMessage();
      this.initilizePingTimer();
    });

    this.#onError && this.#ws.on('error', this.#onError);
    this.#onUpgrade && this.#ws.on('upgrade', this.#onUpgrade);
    this.#onMessage && this.#ws.on('message', this.#onMessage);
  }
  initilizePingTimer() {
    this.#pingTimer = setInterval(() => {
      // this.#isPrivate = false;
      // this.createWebSocket();

      this.sendPing();
      this.sendMessage();

      // this.#isPrivate = true;
      // this.createWebSocket();
      // this.init();
    }, 1000 * 60);
  }
  resetPingTimer() {
    clearInterval(this.#pingTimer);
    this.initilizePingTimer();
  }
  sendMessage() {
    try {
      this.#ws.send(JSON.stringify(this.#requestData));
    } catch (error) {
      logger.error(error);
    }
  }
  sendPing() {
    this.#ws.send('PING');
  }
}

export default Socket;
