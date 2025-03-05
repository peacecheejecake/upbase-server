import { WebSocket, RawData } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import env from '@/env.js';
import logger from '@/utils/logger.js';

import type { SocketCommon } from '../types';

function jwtToken() {
  const payload = {
    access_key: env.ACCESS_KEY,
    nonce: uuidv4(),
  };

  return jwt.sign(payload, env.SECRET_KEY);
}

interface SocketConstructorOptions {
  requestData: SocketCommon.RequestData;
  isPrivate?: boolean;
  lazyInit?: boolean;
  onError?: SocketCommon.ErrorHandler;
  onMessage?: SocketCommon.MessageHandler;
  onUpgrade?: SocketCommon.UpgradeHandler;
}

class Socket {
  private ws: WebSocket;
  private requestData: object;
  private pingTimer: NodeJS.Timeout;
  private isPrivate: boolean = false;

  private onError?: SocketCommon.ErrorHandler;
  private onMessage: SocketCommon.MessageHandler;
  private onUpgrade: SocketCommon.UpgradeHandler;

  constructor({
    requestData,
    isPrivate = false,
    lazyInit = false,
    // onOpen = () => {},
    onError = (ws: WebSocket, error: Error) => {
      logger.error(error);
    },
    onMessage = (ws: WebSocket, data: RawData) => {
      logger.debug(data);
    },
    onUpgrade = null,
  }: SocketConstructorOptions) {
    this.isPrivate = isPrivate;
    this.requestData = requestData;
    this.onError = onError;
    this.onMessage = onMessage;
    this.onUpgrade = onUpgrade;

    if (!lazyInit) {
      this.start();
    }
  }
  get baseUrl() {
    return `${env.BASE_URL_WS}${this.isPrivate ? '/private' : ''}`;
  }
  get socketOptions(): {
    headers?: { authorization: string };
  } {
    return this.isPrivate
      ? {
          headers: { authorization: `Bearer ${jwtToken()}` },
        }
      : {};
  }
  start({
    onMessage = null,
  }: { onMessage?: SocketCommon.MessageHandler } = {}) {
    onMessage && (this.onMessage = onMessage);

    this.ws = new WebSocket(this.baseUrl, this.socketOptions);

    this.ws.on('open', () => {
      this.sendMessage();
      this.initilizePingTimer();
    });

    this.onError && this.ws.on('error', this.onError);
    this.onUpgrade && this.ws.on('upgrade', this.onUpgrade);
    this.onMessage && this.ws.on('message', this.onMessage);
  }
  initilizePingTimer() {
    this.pingTimer = setInterval(() => {
      // this.isPrivate = false;
      // this.createWebSocket();

      this.sendPing();
      this.sendMessage();

      // this.isPrivate = true;
      // this.createWebSocket();
      // this.init();
    }, 1000 * 60);
  }
  resetPingTimer() {
    clearInterval(this.pingTimer);
    this.initilizePingTimer();
  }
  sendMessage() {
    try {
      this.ws.send(JSON.stringify(this.requestData));
    } catch (error) {
      logger.error(error);
    }
  }
  sendPing() {
    this.ws.send('PING');
  }
}

export default Socket;
