import type { SingleBar } from 'cli-progress';

import { cliProgressBar } from '../cli-progress';
import { logger } from '../logger';
import { thrownExceptionToLoggerAsError } from '../utils/thrown-exception';

import { getImageFilesMetaData } from './image-files-meta-data';
import { optimiseImages } from './optimise-images';

export const processStaticImages = async () => {
  let progressBar: SingleBar | undefined;

  logger.info('Processing static images');

  try {
    const { imageFilesMetaData } = await getImageFilesMetaData();

    const totalImagesToProcess = imageFilesMetaData.length;

    // if not accepted image types found then exit
    if (totalImagesToProcess === 0) {
      logger.info('No new images to process.');

      return;
    }

    logger.info(
      `${totalImagesToProcess} total unprocessed images. Processing...`,
    );

    // adjusted eta buffer by total images. If there are many then we want to increase the buffer so
    // eta adjustment is smoother.
    const minEtaBuffer = 10;
    const etaBufferByTotalImages =
      Math.ceil(totalImagesToProcess / 15 / minEtaBuffer) * minEtaBuffer;
    progressBar = cliProgressBar.instantiateInstance({
      etaBuffer: etaBufferByTotalImages,
    });

    // Start progress bar
    progressBar.start(totalImagesToProcess, 0, { speed: 'N/A' });

    await optimiseImages({ imagesFileSystemMetaData: imageFilesMetaData });

    progressBar.stop();

    logger.log(
      'success',
      `thumbnails and image meta saved from permitted image types.`,
    );
  } catch (exception) {
    if (progressBar) progressBar.stop();
    thrownExceptionToLoggerAsError(exception, 'Error processing Images');
  }

  // TODO: caching - ensure that we don't process images that we already - basic
  // TODO: caching - ensure that we don't process images that we already - dev env
  // TODO: cache invalidation (partial & full)
  // TODO: option to process webp images
};
