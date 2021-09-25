import del from 'del';

import {
  rootPublicImageDirectory,
  staticImageMetaDirectoryPath,
} from '../constants';

import { localCacheDirectoryPath } from './caching-constants';

export const clearCache = async () => {
  await Promise.all([
    del(localCacheDirectoryPath),
    del(staticImageMetaDirectoryPath),
    del(rootPublicImageDirectory),
  ]);
};
