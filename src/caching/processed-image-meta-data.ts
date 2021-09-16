import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';

import { thrownExceptionToLoggerAsError } from '../utils/thrown-exception';

import { processedImageMetaDataFilePath } from './constants';

interface ProcessedImageMetaDataCacheAttributes {
  width?: number;
  height?: number;
  imageHash: string;
}

export type ProcessedImageMetaData = Record<
  string,
  ProcessedImageMetaDataCacheAttributes
>;

interface UpsertImageProcessingPrincipleCacheProps {
  /* cache key for each image - using image unique name */
  imageCacheKey: string;
  imageAttributes: ProcessedImageMetaDataCacheAttributes;
}

const getParsedDataByFilePath = <T = unknown>(path: string, fallback?: T) => {
  if (existsSync(path)) {
    try {
      const fileContentString = readFileSync(path).toString();

      return JSON.parse(fileContentString) as T;
    } catch (exception) {
      thrownExceptionToLoggerAsError(
        exception,
        `Unable to parse "${path}". Removing as likely corrupted`,
      );
      unlinkSync(path);
    }
  }

  return fallback as T;
};

/*
 * insert or update processed image meta data cache
 */
export const upsertProcessedImageMetaData = ({
  imageCacheKey,
  imageAttributes,
}: UpsertImageProcessingPrincipleCacheProps) => {
  const processedImageMetaData =
    getParsedDataByFilePath<ProcessedImageMetaData>(
      processedImageMetaDataFilePath,
      {},
    );

  processedImageMetaData[imageCacheKey] = imageAttributes;

  const prettifiedMetaDataString = JSON.stringify(
    processedImageMetaData,
    undefined,
    2,
  );

  writeFileSync(processedImageMetaDataFilePath, prettifiedMetaDataString);
};

export const getProcessedImageMetaData = () => {
  const processedImageMetaData = getParsedDataByFilePath<
    ProcessedImageMetaData | undefined
  >(processedImageMetaDataFilePath);

  return processedImageMetaData;
};
