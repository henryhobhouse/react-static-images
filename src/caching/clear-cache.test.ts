const mockDel = jest.fn().mockImplementation(() => Promise.resolve());
const mockLocalCachePath = 'foo';
const mockStaticImageMetaDirectoryPath = 'bar';
const mockRootPublicImageDirectory = 'baz';

import { clearCache } from './clear-cache';

jest.mock('del', () => ({
  __esModule: true,
  default: mockDel,
}));

jest.mock('../constants', () => ({
  rootPublicImageDirectory: mockRootPublicImageDirectory,
  staticImageMetaDirectoryPath: mockStaticImageMetaDirectoryPath,
}));

jest.mock('./caching-constants', () => ({
  localCacheDirectoryPath: mockLocalCachePath,
}));

describe('clearCache', () => {
  it('will call "del" to recursively delete localCacheDirectoryPath', async () => {
    await clearCache();
    expect(mockDel).toBeCalledWith(mockLocalCachePath);
  });

  it('will call "del" to recursively delete staticImageMetaDirectoryPath', async () => {
    await clearCache();
    expect(mockDel).toBeCalledWith(mockStaticImageMetaDirectoryPath);
  });

  it('will call "del" to recursively delete rootPublicImageDirector', async () => {
    await clearCache();
    expect(mockDel).toBeCalledWith(mockRootPublicImageDirectory);
  });
});
