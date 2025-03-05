import { WebSocket, RawData } from 'ws';
import { IncomingMessage } from 'http';

export namespace SocketCommon {
  export type RequestData = object[];

  export type ErrorHandler = (ws: WebSocket, error: Error) => void;
  export type MessageHandler = (ws: WebSocket, data: RawData) => void;
  export type UpgradeHandler = (
    ws: WebSocket,
    request: IncomingMessage
  ) => void;
}
