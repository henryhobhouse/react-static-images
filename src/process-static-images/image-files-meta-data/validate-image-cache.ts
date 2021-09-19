import type { ProcessedImageMetaData } from '../../caching';
import { getFileContentShortHashByPath } from '../../utils/image-fingerprinting';

/**
 * Validate Image Cache
 *
 * Check if image is in the processed image cache and if the content hash matches (i.e. file has
 * not been edited since it was last processed)
 */
export const validateImageCache = async (
  imagePath: string,
  imageCacheKey: string,
  existingProcessedImageMetaData?: ProcessedImageMetaData,
) => {
  if (!existingProcessedImageMetaData) return false;

  const existingImageCacheAttributes =
    existingProcessedImageMetaData[imageCacheKey];

  if (existingImageCacheAttributes) {
    const imageFileHash = await getFileContentShortHashByPath(imagePath);

    return imageFileHash === existingImageCacheAttributes.imageHash;
  }

  return false;
};
