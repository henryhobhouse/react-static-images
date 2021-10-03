import path from 'path';

import { processedImageMetaDataCache } from '../caching';
import { currentWorkingDirectory, imagesBaseDirectory } from '../constants';
import { createUniqueFileNameFromPath } from '../utils/data-fingerprinting';

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

  return {
    data: processedImageMetaDataCache.currentCache[imageCacheKey],
    uniqueName: imageCacheKey,
  };
};
