import { writeFileSync, promises } from 'fs';

import {
  processedImageMetaDataFilePath,
  localDeveloperCacheFilePath,
} from './constants';
import { getParsedJsonByFilePath } from './get-parsed-json-by-file-path';

export type LocalCache = Record<string, number>;

const isCiPipeline = process.env.CI;

interface AddCacheAttributeProps {
  imageCacheKey: string;
  imageFilePath: string;
}

/**
 *
 */
class LocalDeveloperImageCache {
  private _localDeveloperCache: LocalCache;
  private static instance: LocalDeveloperImageCache;

  constructor() {
    // instantiate local dev cache with cache from file system only if not called in CI pipeline
    this._localDeveloperCache = isCiPipeline
      ? {}
      : getParsedJsonByFilePath<LocalCache>(localDeveloperCacheFilePath, {});
  }

  public static getInstance = () => {
    if (!LocalDeveloperImageCache.instance) {
      LocalDeveloperImageCache.instance = new LocalDeveloperImageCache();
    }

    return LocalDeveloperImageCache.instance;
  };

  public get currentDevCache() {
    return this._localDeveloperCache;
  }

  public async addCacheAttribute({
    imageCacheKey,
    imageFilePath,
  }: AddCacheAttributeProps) {
    const imageStats = await promises.stat(imageFilePath);

    this._localDeveloperCache[imageCacheKey] = imageStats.mtimeMs;
  }

  public saveCacheToFileSystem() {
    const prettifiedMetaDataString = JSON.stringify(
      this._localDeveloperCache,
      undefined,
      2,
    );

    writeFileSync(processedImageMetaDataFilePath, prettifiedMetaDataString);
  }
}

const localDeveloperImageCacheSingleton = new LocalDeveloperImageCache();

/*
 * insert or update processed image meta data cache
 */
export const localDeveloperImageCache = localDeveloperImageCacheSingleton;
