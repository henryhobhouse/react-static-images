import { promises } from 'fs';

import {
  localDeveloperImageCache,
  processedImageMetaDataCache,
} from '../../caching';
import { getFileContentShortHashByPath } from '../../utils/data-fingerprinting';

/**
 * Validate Image Cache
 *
 * Check if image is in the processed image cache and if the content hash matches (i.e. file has
 * not been edited since it was last processed)
 */
export const validateImageCached = async (
  imagePath: string,
  imageCacheKey: string,
) => {
  const previouslyProcessedImageMetaData =
    processedImageMetaDataCache.currentCache;

  // if no base cache then no cache can exist so return false
  if (Object.keys(previouslyProcessedImageMetaData).length === 0) return false;

  const imageStats = await promises.stat(imagePath);

  // check if there is a valid local dev cache (fast check)
  if (
    localDeveloperImageCache.currentDevCache[imageCacheKey] ===
    imageStats.mtimeMs
  ) {
    return true;
  }

  const existingImageCacheAttributes =
    previouslyProcessedImageMetaData[imageCacheKey];

  // if no valid dev cache then check meta data cache by getting image hash of contents and checking there has been
  // no change
  if (existingImageCacheAttributes) {
    const imageFileHash = await getFileContentShortHashByPath(imagePath);

    const fileHashMatchesCache =
      imageFileHash === existingImageCacheAttributes.imageHash;

    if (fileHashMatchesCache) {
      localDeveloperImageCache.addCacheAttribute({
        imageCacheKey,
        lastTimeFileUpdatedInMs: imageStats.mtimeMs,
      });
    }

    return fileHashMatchesCache;
  }

  // if no valid cache found then return false
  return false;
};
