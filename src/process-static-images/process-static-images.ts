import type { SingleBar } from 'cli-progress';

import { cliProgressBar } from '../cli-progress';
import { logger } from '../logger';
import { getStaticImageConfig } from '../static-image-config';
import { thrownExceptionToLoggerAsError } from '../utils/thrown-exception';
import { validateRequiredDirectoryPaths } from '../utils/validate-required-directory-paths';

import { rootPublicImageDirectory, thumbnailDirectoryPath } from './constants';
import { getImageFilesMetaData } from './image-files-meta-data';
import { optimiseImages } from './optimise-images';

const { optimisedImageSizes } = getStaticImageConfig();

/**
 * Gets all images by recursively searching from root of content directory as set
 * in the config. Once obtained it processes all image to out, as configured:
 *
 * * thumbnails (in base64 encoding)
 * * images optimised by size
 *
 * All this whilst caching the results for performant re-checking after initial optimisation
 */
export const processStaticImages = async () => {
  let progressBar: SingleBar | undefined;

  logger.info('Processing static images');

  try {
    validateRequiredDirectoryPaths({
      optimisedImageSizes,
      rootPublicImageDirectory,
      thumbnailDirectoryPath,
    });

    const { imageFilesMetaData, totalImagesCached, totalImagesFound } =
      await getImageFilesMetaData();

    logger.info(`Found ${totalImagesFound} images in accepted image format`);
    if (totalImagesCached)
      logger.info(`${totalImagesCached} of those have valid cache present`);

    const totalImagesToProcess = imageFilesMetaData.length;

    // if not accepted image types found then exit
    if (totalImagesToProcess === 0) {
      logger.info('No new images to process.');

      return;
    }

    logger.info(`${totalImagesToProcess} images to process. Processing...`);

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

  // TODO: cache invalidation (partial & full)
  // TODO: option to process webp images
};
