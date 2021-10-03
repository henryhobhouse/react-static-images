const mockWriteFileSync = jest.fn();

const mockProcessedImageMetaDataFilePath = '/foo/bar';
const mockGetParsedJsonByFilePath = jest.fn().mockReturnValue({});

jest.mock('fs', () => ({
  writeFileSync: mockWriteFileSync,
}));

jest.mock('./caching-constants', () => ({
  processedImageMetaDataFilePath: mockProcessedImageMetaDataFilePath,
}));

jest.mock('../utils/get-parsed-json-by-file-path', () => ({
  getParsedJsonByFilePath: mockGetParsedJsonByFilePath,
}));

describe('processedImageMetaDataCache', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('will returned the parsed contents of the processed image meta data file if exists', async () => {
    const testCacheFromPath = { foo: 'bar' };
    mockGetParsedJsonByFilePath.mockReturnValueOnce(testCacheFromPath);

    const { processedImageMetaDataCache: cacheInstance } = await import(
      './processed-image-cache'
    );

    expect(cacheInstance.currentCache).toEqual(testCacheFromPath);
  });

  it('will add to the current cache but not save to file system on calling addCacheAttribute', async () => {
    const testCacheFromPath = { foo: 'bar' };
    mockGetParsedJsonByFilePath.mockReturnValueOnce(testCacheFromPath);

    const { processedImageMetaDataCache: cacheInstance } = await import(
      './processed-image-cache'
    );

    expect(cacheInstance.currentCache).toEqual(testCacheFromPath);

    const testImageCacheKey = 'baz';
    const testImageAttributes = { imageHash: '' };

    cacheInstance.addCacheAttribute({
      imageAttributes: testImageAttributes,
      imageCacheKey: testImageCacheKey,
    });

    expect(cacheInstance.currentCache).toEqual({
      ...testCacheFromPath,
      [testImageCacheKey]: testImageAttributes,
    });
    expect(mockWriteFileSync).not.toBeCalled();
  });

  it('will retrieve the same reference/class instantiation on each import', async () => {
    const { processedImageMetaDataCache: cacheInstance1 } = await import(
      './processed-image-cache'
    );

    const { processedImageMetaDataCache: cacheInstance2 } = await import(
      './processed-image-cache'
    );

    expect(cacheInstance1 === cacheInstance2).toBeTruthy();
  });

  it('will save the current cache to the file system on saveCacheToFileSystem', async () => {
    const testCacheFromPath = { baz: 'qwerty' };
    mockGetParsedJsonByFilePath.mockReturnValueOnce(testCacheFromPath);

    const { processedImageMetaDataCache: cacheInstance } = await import(
      './processed-image-cache'
    );

    const newMetadata = { imageHash: 'qwerty' };
    const newUniqueKey = 'baz';

    cacheInstance.saveCacheToFileSystem();

    expect(mockWriteFileSync).toBeCalledWith(
      mockProcessedImageMetaDataFilePath,
      JSON.stringify(testCacheFromPath, undefined, 2),
    );

    cacheInstance.addCacheAttribute({
      imageAttributes: newMetadata,
      imageCacheKey: newUniqueKey,
    });

    cacheInstance.saveCacheToFileSystem();

    expect(mockWriteFileSync.mock.calls[1]).toEqual([
      mockProcessedImageMetaDataFilePath,
      JSON.stringify(
        {
          ...testCacheFromPath,
          [newUniqueKey]: newMetadata,
        },
        undefined,
        2,
      ),
    ]);
  });

  it('will remove to the current cache but not save to file system on calling removeCacheAttribute', async () => {
    const testCacheFromPath = { foo: 'bar' };
    mockGetParsedJsonByFilePath.mockReturnValueOnce(testCacheFromPath);

    const { processedImageMetaDataCache: cacheInstance } = await import(
      './processed-image-cache'
    );

    expect(cacheInstance.currentCache).toEqual(testCacheFromPath);

    cacheInstance.removeCacheAttribute('foo');

    expect(cacheInstance.currentCache).toEqual({ foo: undefined });

    expect(mockWriteFileSync).not.toBeCalled();
  });
});
