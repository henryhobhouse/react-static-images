import { writeFileSync } from 'fs';

import type { ImageFormat } from '../static-image-config';
import { getParsedJsonByFilePath } from '../utils/get-parsed-json-by-file-path';

import { processedImageMetaDataFilePath } from './caching-constants';

export interface ProcessedImageMetaDataCacheAttributes {
  width?: number;
  height?: number;
  originalFileType?: ImageFormat;
  imageHash: string;
}

export type ProcessedImageMetaDataCache = Record<
  string,
  ProcessedImageMetaDataCacheAttributes | undefined
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

  public update() {
    this._currentCache = getParsedJsonByFilePath<ProcessedImageMetaDataCache>(
      processedImageMetaDataFilePath,
      {},
    );
  }

  public removeCacheAttribute(imageCacheKey: string) {
    // as this could be a large object. Instead of de-optimising the V8 engine using delete
    // we just want to assign no value instead.
    this._currentCache[imageCacheKey] = undefined;
  }

  public addCacheAttribute({
    imageCacheKey,
    imageAttributes,
  }: AddCacheAttributeProps) {
    this._currentCache[imageCacheKey] = imageAttributes;
  }

  public saveCacheToFileSystem() {
    // as we don't want invalid keys to persist to the file system we remove
    // all properties that have no value
    const filteredCache: ProcessedImageMetaDataCache = {};
    for (const key in this._currentCache) {
      if (this._currentCache[key]) {
        filteredCache[key] = this._currentCache[key];
      }
    }

    const prettifiedMetaDataString = JSON.stringify(
      filteredCache,
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
