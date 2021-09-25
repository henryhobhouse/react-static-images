import del from 'del';

import { staticImageMetaDirectoryPath } from '../constants';

import { localCacheDirectoryPath } from './caching-constants';

export const clearCache = async () => {
  await del(localCacheDirectoryPath);
  await del(staticImageMetaDirectoryPath);
};
