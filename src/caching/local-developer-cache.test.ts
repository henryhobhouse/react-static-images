const mockLastUpdatedTime = 12_345;

const mockWriteFileSyncPc = jest.fn();
const mockFsStats = jest.fn().mockImplementation(() =>
  Promise.resolve({
    mtimeMs: mockLastUpdatedTime,
  }),
);

const mockProcessedImageMetaDataFilePathPc = '/foo/bar';
const mockGetParsedJsonByFilePathPc = jest.fn().mockReturnValue({});

jest.mock('fs', () => ({
  promises: {
    stat: mockFsStats,
  },
  writeFileSync: mockWriteFileSyncPc,
}));

jest.mock('./constants', () => ({
  processedImageMetaDataFilePath: mockProcessedImageMetaDataFilePathPc,
}));

jest.mock('./get-parsed-json-by-file-path', () => ({
  getParsedJsonByFilePath: mockGetParsedJsonByFilePathPc,
}));

describe('localDeveloperImageCache', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('will returned the parsed contents of the local developer cache file if exists', async () => {
    const testCacheFromPath = { foo: 'bar' };
    mockGetParsedJsonByFilePathPc.mockReturnValueOnce(testCacheFromPath);

    const { localDeveloperImageCache: cacheInstance } = await import(
      './local-developer-cache'
    );

    expect(cacheInstance.currentDevCache).toEqual(testCacheFromPath);
  });

  it('will update the current cache but not save to file system on calling addCacheAttribute', async () => {
    const testCacheFromPath = { foo: 'bar' };
    mockGetParsedJsonByFilePathPc.mockReturnValueOnce(testCacheFromPath);

    const { localDeveloperImageCache: cacheInstance } = await import(
      './local-developer-cache'
    );

    expect(cacheInstance.currentDevCache).toEqual(testCacheFromPath);

    const testImageCacheKey = 'baz';
    const testImageFilePath = './foo/bar';

    await cacheInstance.addCacheAttribute({
      imageCacheKey: testImageCacheKey,
      imageFilePath: testImageFilePath,
    });

    expect(cacheInstance.currentDevCache).toEqual({
      ...testCacheFromPath,
      [testImageCacheKey]: mockLastUpdatedTime,
    });
    expect(mockWriteFileSyncPc).not.toBeCalled();
  });

  it('will retrieve the same reference/class instantiation on each import', async () => {
    const { localDeveloperImageCache: cacheInstance1 } = await import(
      './local-developer-cache'
    );

    const { localDeveloperImageCache: cacheInstance2 } = await import(
      './local-developer-cache'
    );

    expect(cacheInstance1 === cacheInstance2).toBeTruthy();
  });

  it('will save the current cache to the file system on saveCacheToFileSystem', async () => {
    const testCacheFromPath = { baz: 'qwerty' };
    mockGetParsedJsonByFilePathPc.mockReturnValueOnce(testCacheFromPath);

    const { localDeveloperImageCache: cacheInstance } = await import(
      './local-developer-cache'
    );

    const newFilePath = './foo/bar';
    const newUniqueKey = 'baz';

    cacheInstance.saveCacheToFileSystem();

    expect(mockWriteFileSyncPc).toBeCalledWith(
      mockProcessedImageMetaDataFilePathPc,
      JSON.stringify(testCacheFromPath, undefined, 2),
    );

    await cacheInstance.addCacheAttribute({
      imageCacheKey: newUniqueKey,
      imageFilePath: newFilePath,
    });

    cacheInstance.saveCacheToFileSystem();

    expect(mockWriteFileSyncPc.mock.calls[1]).toEqual([
      mockProcessedImageMetaDataFilePathPc,
      JSON.stringify(
        {
          ...testCacheFromPath,
          [newUniqueKey]: mockLastUpdatedTime,
        },
        undefined,
        2,
      ),
    ]);
  });
});
