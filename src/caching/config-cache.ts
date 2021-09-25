import { writeFileSync } from 'fs';

import { getStaticImageConfig } from '../static-image-config';
import { createShortHashFromString } from '../utils/data-fingerprinting';

import { configCacheFilePath } from './caching-constants';
import { getParsedJsonByFilePath } from './get-parsed-json-by-file-path';

const currentConfig = getStaticImageConfig();

export interface BuildCache {
  previousConfigHash?: string;
}

const getConfigCache = () => {
  return getParsedJsonByFilePath<BuildCache>(configCacheFilePath, {});
};

export const saveCurrentConfigToCache = () => {
  const currentConfigHash = createShortHashFromString(
    JSON.stringify(currentConfig),
  );
  const newConfigCache = {
    previousConfigHash: currentConfigHash,
  };
  writeFileSync(
    configCacheFilePath,
    JSON.stringify(newConfigCache, undefined, 2),
  );
};

export const isCurrentConfigMatchingCache = () => {
  const previousConfigHash = getConfigCache().previousConfigHash;

  // if no previous config then assume clean build so return false
  if (!previousConfigHash) return false;

  const currentConfigHash = createShortHashFromString(
    JSON.stringify(currentConfig),
  );

  return currentConfigHash === previousConfigHash;
};
