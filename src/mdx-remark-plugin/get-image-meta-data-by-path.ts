import { readFileSync } from 'fs';
import path from 'path';

import { processedImageMetaDataCache } from '../caching';
import {
  currentWorkingDirectory,
  imagesBaseDirectory,
  thumbnailDirectoryPath,
} from '../constants';
import { createUniqueFileNameFromPath } from '../utils/data-fingerprinting';
import { thrownExceptionToLoggerAsError } from '../utils/thrown-exception';

/**
 * getImageMetaDataByPath
 *
 * Determines path from current working directory, using the short hash from this retrieves
 * the image meta date.
 */
export const getImageMetaDataByPath = (
  imagePath: string,
  nodeFileDirectoryPath: string,
) => {
  const imageFileName = path.basename(imagePath);
  // if image path starts with path separator then assume absolute from image base
  // directory as set in the configuration. Otherwise take as relative from node directory
  // path.
  const pathRelativeToCwd =
    imagePath.startsWith('/') || imagePath.startsWith(path.sep)
      ? path.join(imagesBaseDirectory, imagePath)
      : path
          .join(nodeFileDirectoryPath, imagePath)
          .replace(currentWorkingDirectory, '');

  const imageCacheKey = createUniqueFileNameFromPath(
    pathRelativeToCwd,
    path.parse(imageFileName).name,
  );

  let placeholderBase64 = '';

  try {
    placeholderBase64 = readFileSync(
      `${thumbnailDirectoryPath}/${imageCacheKey}`,
    ).toString();
  } catch (exception) {
    thrownExceptionToLoggerAsError(
      exception,
      `Unable to get image thumbnail for path ${imageCacheKey}`,
    );
  }

  const cacheData = processedImageMetaDataCache.currentCache[imageCacheKey];

  return cacheData
    ? {
        ...cacheData,
        placeholderBase64,
        uniqueName: imageCacheKey,
      }
    : undefined;
};
