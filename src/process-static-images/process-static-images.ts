import { logger } from '../logger';

import { getImageMetaData } from './get-images-meta-data';

export const processStaticImages = async () => {
  logger.info('Processing static images');

  const { imageFilesMetaData } = await getImageMetaData();

  const totalImagesToProcess = imageFilesMetaData.length;

  // if not accepted image types found then exit
  if (totalImagesToProcess === 0) {
    logger.info('No new images to process.');

    return;
  }

  logger.info(`${totalImagesToProcess} total unprocessed images`);

  // create thumbnails and required image sizes
  // caching - ensure that we don't process images that we already
  // browser caching - adding hash fingerprint to file name
};
