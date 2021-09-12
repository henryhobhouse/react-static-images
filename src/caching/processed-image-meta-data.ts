import { existsSync, readFileSync, writeFileSync } from 'fs';

import { processedImageMetaDataFilePath } from './constants';

interface ProcessedImageMetaDataCacheAttributes {
  width?: number;
  height?: number;
  imageHash: string;
}

interface UpsertImageProcessingPrincipleCacheProps {
  /* cache key for each image - using image unique name */
  imageCacheKey: string;
  imageAttributes: ProcessedImageMetaDataCacheAttributes;
}

/*
 * insert or update processed image meta data cache
 */
export const upsertProcessedImageMetaData = ({
  imageCacheKey,
  imageAttributes,
}: UpsertImageProcessingPrincipleCacheProps) => {
  // if image size file doesn't exist yet create it
  if (!existsSync(processedImageMetaDataFilePath)) {
    writeFileSync(processedImageMetaDataFilePath, '{}');
  }

  const imageMetaDataString = readFileSync(
    processedImageMetaDataFilePath,
  ).toString();

  const imageMetaData = JSON.parse(imageMetaDataString);

  imageMetaData[imageCacheKey] = imageAttributes;

  const prettifiedMetaDataString = JSON.stringify(imageMetaData, undefined, 2);

  writeFileSync(processedImageMetaDataFilePath, prettifiedMetaDataString);
};
