import { WebSocket, RawData } from 'ws';
import { IncomingMessage } from 'http';

export namespace SocketCommon {
  export type RequestData = object[];

  export type ErrorHandler = (error: Error) => void;
  export type MessageHandler = (data: RawData) => void;
  export type UpgradeHandler = (
    request: IncomingMessage
  ) => void;
}
