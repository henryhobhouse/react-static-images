import { logger } from '../logger';

export const processStaticImages = () => {
  logger.info('Processing static images');
  // get configuration for images - thumbnail size, image sizes, accepted original image types, directory images are stored.
  // get meta data on images that need processing paths, total
  // caching - ensure that we don't process images that we already
  // browser caching - adding hash fingerprint to file name
};
