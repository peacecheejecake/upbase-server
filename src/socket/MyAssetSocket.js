import Socket from './base/Socket.js';
import logger from '../utils/logger.js';

class MyAssetSocket extends Socket {
  #assets;

  constructor({ lazyInit = false, initialAssets }) {
    super({
      requestData: [
        { ticket: 'my-asset' },
        { type: 'myAsset' },
        { format: 'DEFAULT' },
      ],
      lazyInit,
      isPrivate: true,
      onMessage: (data) => {
        try {
          const assets = JSON.parse(data.toString())?.assets;

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
