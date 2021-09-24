import { writeFileSync } from 'fs';

import { processedImageMetaDataFilePath } from './caching-constants';
import { getParsedJsonByFilePath } from './get-parsed-json-by-file-path';

export interface ProcessedImageMetaDataCacheAttributes {
  width?: number;
  height?: number;
  imageHash: string;
}

export type ProcessedImageMetaDataCache = Record<
  string,
  ProcessedImageMetaDataCacheAttributes
>;

export type LocalDeveloperCache = Record<string, number>;

interface AddCacheAttributeProps {
  /* cache key for each image - using image unique name */
  imageCacheKey: string;
  imageAttributes: ProcessedImageMetaDataCacheAttributes;
}

/**
 *
 */
class ProcessedImageCache {
  private _currentCache: ProcessedImageMetaDataCache;
  private static instance: ProcessedImageCache;

  constructor() {
    this._currentCache = getParsedJsonByFilePath<ProcessedImageMetaDataCache>(
      processedImageMetaDataFilePath,
      {},
    );
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
