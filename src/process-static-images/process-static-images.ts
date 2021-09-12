import { cliProgressBar } from '../cli-progress';
import { logger } from '../logger';

import { getImageFilesMetaData } from './image-files-meta-data';

export const processStaticImages = async () => {
  logger.info('Processing static images');

  const { imageFilesMetaData } = await getImageFilesMetaData();

  const totalImagesToProcess = imageFilesMetaData.length;

  // if not accepted image types found then exit
  if (totalImagesToProcess === 0) {
    logger.info('No new images to process.');

    return;
  }

  logger.info(`${totalImagesToProcess} total unprocessed images`);

  const progressBar = cliProgressBar.instantiateInstance();

  // Start progress bar
  progressBar.start(totalImagesToProcess, 0, {
    speed: 'N/A',
  });

  // create thumbnails and required image sizes
  // browser caching - adding hash fingerprint to file name
  // caching - ensure that we don't process images that we already
};
