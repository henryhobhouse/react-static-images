const mockDel = jest.fn().mockImplementation(() => Promise.resolve());
const mockLocalCachePath = 'foo';
const mockStaticImageMetaDirectoryPath = 'bar';
const mockRootPublicImageDirectory = 'baz';

import { clearFileSystemCache } from './clear-file-system-cache';

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

describe('clearFileSystemCache', () => {
  it('will call "del" to recursively delete localCacheDirectoryPath', async () => {
    await clearFileSystemCache();
    expect(mockDel).toBeCalledWith(mockLocalCachePath);
  });

  it('will call "del" to recursively delete staticImageMetaDirectoryPath', async () => {
    await clearFileSystemCache();
    expect(mockDel).toBeCalledWith(mockStaticImageMetaDirectoryPath);
  });

  it('will call "del" to recursively delete rootPublicImageDirector', async () => {
    await clearFileSystemCache();
    expect(mockDel).toBeCalledWith(mockRootPublicImageDirectory);
  });
});
