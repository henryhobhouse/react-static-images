import { logger } from '../logger';
import { staticImageConfig } from '../static-image-config';

export const processStaticImages = () => {
  logger.info('Processing static images');
  const config = staticImageConfig();
  // get meta data on images that need processing paths, total
  // create thumbnails and required image sizes
  // caching - ensure that we don't process images that we already
  // browser caching - adding hash fingerprint to file name
};
