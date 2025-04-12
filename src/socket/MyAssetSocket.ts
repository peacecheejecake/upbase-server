import Socket from './base/Socket';
import logger from '../utils/logger';

interface AssetShortHand {
  cu: string;
  b: number;
  l: number;
  asttms: number;
  tms: number;
  st: 'REALTIME';
}
interface AssetSocketDataShortHand {
  ty?: 'myAsset';
  astuid?: string;
  ast: AssetShortHand[];
}
interface AssetFullHand {
  currency: string;
  balance: number;
  locked: number;
  asset_timestamp: number;
  timestamp: number;
  stream_type: 'REALTIME';
}
interface AssetSocketDataFullHand {
  type: 'myAsset';
  asset_uuid?: string;
  assets: AssetFullHand[];
}

// type Asset = AssetShortHand | AssetFullHand;
// type AssetSocketData = AssetSocketDataFullHand | AssetSocketDataShortHand;
type Asset = AssetFullHand;
type AssetSocketData = AssetSocketDataFullHand;

interface MyAssetSocketConsturctorOptions {
  lazyInit?: boolean;
  initialAssets?: Asset[];
}

class MyAssetSocket extends Socket {
  #assets: {};

  constructor({
    lazyInit = false,
    initialAssets,
  }: MyAssetSocketConsturctorOptions) {
    super({
      requestData: [
        { ticket: 'my-asset' },
        { type: 'myAsset' },
        { format: 'DEFAULT' },
      ],
      lazyInit,
      isPrivate: true,
      onMessage: (ws, data) => {
        try {
          const assets = (
            JSON.parse(data.toString()) as AssetSocketDataFullHand
          ).assets;

          if (assets?.length > 0) {
            assets.forEach((asset) => {
              this.#assets[asset.currency] = asset;
            });
            logger.debug('[MyAssetSocket] ' + JSON.stringify(this.#assets));
          }
        } catch (error) {
          logger.error('[MyAssetSocket] error', error);
        }
      },
    });

    // this.initializeAssets();
    this.#assets = initialAssets
      ? Array.isArray(initialAssets)
        ? Object.fromEntries(
            initialAssets.map((asset) => [asset.currency, asset])
          )
        : initialAssets
      : {};

    logger.info('[MyAssetSocket] initialized');
  }
  currentAssets() {
    return this.#assets;
  }
}

export default MyAssetSocket;
