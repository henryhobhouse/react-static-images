const mockWriteFileSyncPc = jest.fn();

const mockLocalDeveloperCacheFilePath = '/foo/bar';
const mockGetParsedJsonByFilePathPc = jest.fn().mockReturnValue({});

jest.mock('fs', () => ({
  writeFileSync: mockWriteFileSyncPc,
}));

jest.mock('./constants', () => ({
  localDeveloperCacheFilePath: mockLocalDeveloperCacheFilePath,
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
    const testLastUpdateTimeInMs = 98_734_435_202_738;

    cacheInstance.addCacheAttribute({
      imageCacheKey: testImageCacheKey,
      lastTimeFileUpdatedInMs: testLastUpdateTimeInMs,
    });

    expect(cacheInstance.currentDevCache).toEqual({
      ...testCacheFromPath,
      [testImageCacheKey]: testLastUpdateTimeInMs,
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

    const testLastUpdateTimeInMs = 98_734_202_738;
    const newUniqueKey = 'baz';

    cacheInstance.saveCacheToFileSystem();

    expect(mockWriteFileSyncPc).toBeCalledWith(
      mockLocalDeveloperCacheFilePath,
      JSON.stringify(testCacheFromPath, undefined, 2),
    );

    cacheInstance.addCacheAttribute({
      imageCacheKey: newUniqueKey,
      lastTimeFileUpdatedInMs: testLastUpdateTimeInMs,
    });

    cacheInstance.saveCacheToFileSystem();

    expect(mockWriteFileSyncPc.mock.calls[1]).toEqual([
      mockLocalDeveloperCacheFilePath,
      JSON.stringify(
        {
          ...testCacheFromPath,
          [newUniqueKey]: testLastUpdateTimeInMs,
        },
        undefined,
        2,
      ),
    ]);
  });
});
