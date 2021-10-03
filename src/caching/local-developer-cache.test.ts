const mockWriteFileSyncPc = jest.fn();

const mockLocalDeveloperCacheFilePath = '/foo/bar';
const mockGetParsedJsonByFilePathPc = jest.fn().mockReturnValue({});

jest.mock('fs', () => ({
  writeFileSync: mockWriteFileSyncPc,
}));

jest.mock('./caching-constants', () => ({
  localDeveloperCacheFilePath: mockLocalDeveloperCacheFilePath,
}));

jest.mock('../utils/get-parsed-json-by-file-path', () => ({
  getParsedJsonByFilePath: mockGetParsedJsonByFilePathPc,
}));

const preTestProcessCiValue = process.env.CI;

describe('localDeveloperImageCache', () => {
  beforeAll(() => {
    process.env.CI = undefined;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env.CI = undefined;
  });

  afterAll(() => {
    process.env.CI = preTestProcessCiValue;
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

  it('will return always return an empty object if in CI pipeline', async () => {
    const testCacheFromPath = { foo: 'bar' };
    process.env.CI = 'true';
    mockGetParsedJsonByFilePathPc.mockReturnValueOnce(testCacheFromPath);

    const { localDeveloperImageCache: cacheInstance } = await import(
      './local-developer-cache'
    );

    expect(cacheInstance.currentDevCache).toEqual({});
  });

  it('will not attempt to save cache to file if in CI pipeline', async () => {
    const testCacheFromPath = { foo: 'bar' };
    process.env.CI = 'true';
    mockGetParsedJsonByFilePathPc.mockReturnValueOnce(testCacheFromPath);

    const { localDeveloperImageCache: cacheInstance } = await import(
      './local-developer-cache'
    );

    cacheInstance.saveCacheToFileSystem();

    expect(mockWriteFileSyncPc).not.toBeCalled();
  });

  it('will remove to the current cache but not save to file system on calling removeCacheAttribute', async () => {
    const testCacheFromPath = { foo: 'bar' };
    mockGetParsedJsonByFilePathPc.mockReturnValueOnce(testCacheFromPath);

    const { localDeveloperImageCache: cacheInstance } = await import(
      './local-developer-cache'
    );

    expect(cacheInstance.currentDevCache).toEqual(testCacheFromPath);

    cacheInstance.removeCacheAttribute('foo');

    expect(cacheInstance.currentDevCache).toEqual({ foo: undefined });

    expect(mockWriteFileSyncPc).not.toBeCalled();
  });
});
