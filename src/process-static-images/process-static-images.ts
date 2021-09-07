import { logger } from '../logger';

import { getImageMetaData } from './get-images-meta-data';

export const processStaticImages = async () => {
  logger.info('Processing static images');

  const { imagesMetaData } = await getImageMetaData();
  // get meta data on images that need processing paths, total
  // create thumbnails and required image sizes
  // caching - ensure that we don't process images that we already
  // browser caching - adding hash fingerprint to file name
};
