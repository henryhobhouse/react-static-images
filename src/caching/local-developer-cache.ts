import { writeFileSync } from 'fs';

import { localDeveloperCacheFilePath } from './constants';
import { getParsedJsonByFilePath } from './get-parsed-json-by-file-path';

export type LocalCache = Record<string, number>;

const isCiPipeline = process.env.CI === 'true';

interface AddCacheAttributeProps {
  imageCacheKey: string;
  lastTimeFileUpdatedInMs: number;
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

  public addCacheAttribute({
    imageCacheKey,
    lastTimeFileUpdatedInMs,
  }: AddCacheAttributeProps) {
    if (isCiPipeline) return;
    this._localDeveloperCache[imageCacheKey] = lastTimeFileUpdatedInMs;
  }

  public saveCacheToFileSystem() {
    if (isCiPipeline) return;
    const prettifiedMetaDataString = JSON.stringify(
      this._localDeveloperCache,
      undefined,
      2,
    );

    writeFileSync(localDeveloperCacheFilePath, prettifiedMetaDataString);
  }
}

const localDeveloperImageCacheSingleton = new LocalDeveloperImageCache();

/*
 * insert or update processed image meta data cache
 */
export const localDeveloperImageCache = localDeveloperImageCacheSingleton;
