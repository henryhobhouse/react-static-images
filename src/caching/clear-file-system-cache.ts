import { deleteAsync } from 'del';

import {
  rootPublicImageDirectory,
  staticImageMetaDirectoryPath,
} from '../constants';

import { localCacheDirectoryPath } from './caching-constants';

export const clearFileSystemCache = async () => {
  await Promise.all([
    deleteAsync(localCacheDirectoryPath),
    deleteAsync(staticImageMetaDirectoryPath),
    deleteAsync(rootPublicImageDirectory),
  ]);
};
