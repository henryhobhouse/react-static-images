import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';

import { thrownExceptionToLoggerAsError } from '../utils/thrown-exception';

import { processedImageMetaDataFilePath } from './constants';

interface ProcessedImageMetaDataCacheAttributes {
  width?: number;
  height?: number;
  imageHash: string;
}

export type ProcessedImageMetaDataCache = Record<
  string,
  ProcessedImageMetaDataCacheAttributes
>;

interface AddCacheAttributeProps {
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
        `Unable to retrieve and parse data from "${path}". Removing as likely corrupted`,
      );
      unlinkSync(path);
    }
  }

  return fallback as T;
};

class ProcessedImageCache {
  private _currentCache: ProcessedImageMetaDataCache;
  private static instance: ProcessedImageCache;

  constructor() {
    const cacheOnFileSystem =
      getParsedDataByFilePath<ProcessedImageMetaDataCache>(
        processedImageMetaDataFilePath,
        {},
      );
    this._currentCache = cacheOnFileSystem;
  }

  public static getInstance = () => {
    if (!ProcessedImageCache.instance) {
      ProcessedImageCache.instance = new ProcessedImageCache();
    }

    return ProcessedImageCache.instance;
  };

  public get currentCache() {
    return this._currentCache;
  }

  public addCacheAttribute({
    imageCacheKey,
    imageAttributes,
  }: AddCacheAttributeProps) {
    this._currentCache[imageCacheKey] = imageAttributes;
  }

  public saveCacheToFileSystem() {
    const prettifiedMetaDataString = JSON.stringify(
      this._currentCache,
      undefined,
      2,
    );

    writeFileSync(processedImageMetaDataFilePath, prettifiedMetaDataString);
  }
}

const processedImageMetaDataCacheSingleton = new ProcessedImageCache();

/*
 * insert or update processed image meta data cache
 */
export const processedImageMetaDataCache = processedImageMetaDataCacheSingleton;
