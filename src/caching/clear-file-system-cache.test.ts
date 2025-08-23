import del from 'del';

import { clearFileSystemCache } from './clear-file-system-cache';

jest.mock('del', () => {
  const mockDel = jest.fn().mockImplementation(() => Promise.resolve());

  return {
    __esModule: true,
    default: mockDel,
  };
});

jest.mock('../constants', () => {
  const mockRootPublicImageDirectory = 'baz';
  const mockStaticImageMetaDirectoryPath = 'bar';

  return {
    rootPublicImageDirectory: mockRootPublicImageDirectory,
    staticImageMetaDirectoryPath: mockStaticImageMetaDirectoryPath,
  };
});

jest.mock('./caching-constants', () => {
  const mockLocalCachePath = 'foo';

  return {
    localCacheDirectoryPath: mockLocalCachePath,
  };
});

const mockDel = del as jest.MockedFunction<typeof del>;

const mockLocalCachePath = 'foo';
const mockStaticImageMetaDirectoryPath = 'bar';
const mockRootPublicImageDirectory = 'baz';

describe('clearFileSystemCache', () => {
  it('will call "del" to recursively delete localCacheDirectoryPath', async () => {
    await clearFileSystemCache();
    expect(mockDel).toHaveBeenCalledWith(mockLocalCachePath);
  });

  it('will call "del" to recursively delete staticImageMetaDirectoryPath', async () => {
    await clearFileSystemCache();
    expect(mockDel).toHaveBeenCalledWith(mockStaticImageMetaDirectoryPath);
  });

  it('will call "del" to recursively delete rootPublicImageDirectory', async () => {
    await clearFileSystemCache();
    expect(mockDel).toHaveBeenCalledWith(mockRootPublicImageDirectory);
  });
});
