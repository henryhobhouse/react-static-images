const initialValueMetaDataJson = { foo: 'bar' };
const mockReadFileSync = jest
  .fn()
  .mockImplementation(() =>
    Buffer.from(JSON.stringify(initialValueMetaDataJson)),
  );
const mockWriteFileSync = jest.fn();
const mockExistsSync = jest.fn();
const mockUnlinkSync = jest.fn();
const mockProcessedImageMetaDataFilePath = '/foo/bar';
const mockThrownExceptionToLoggerAsError = jest.fn();

jest.mock('fs', () => ({
  existsSync: mockExistsSync,
  readFileSync: mockReadFileSync,
  unlinkSync: mockUnlinkSync,
  writeFileSync: mockWriteFileSync,
}));

jest.mock('./constants', () => ({
  processedImageMetaDataFilePath: mockProcessedImageMetaDataFilePath,
}));

jest.mock('../utils/thrown-exception', () => ({
  thrownExceptionToLoggerAsError: mockThrownExceptionToLoggerAsError,
}));

describe('processedImageMetaDataCache', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('will returned the parsed contents of the processed image meta data file if exists', async () => {
    mockExistsSync.mockReturnValueOnce(true);

    const { processedImageMetaDataCache: cacheInstance } = await import(
      './processed-image-cache'
    );

    expect(cacheInstance.currentCache).toEqual(initialValueMetaDataJson);
  });

  it('will return a fallback of an empty object if processed image meta data file does not exist', async () => {
    mockExistsSync.mockReturnValueOnce(false);

    const { processedImageMetaDataCache: cacheInstance } = await import(
      './processed-image-cache'
    );

    expect(cacheInstance.currentCache).toEqual({});
  });

  it('will update the current cache but not save to file system on calling addCacheAttribute', async () => {
    mockExistsSync.mockReturnValueOnce(false);

    const { processedImageMetaDataCache: cacheInstance } = await import(
      './processed-image-cache'
    );

    const testImageCacheKey = 'baz';
    const testImageAttributes = { imageHash: '' };

    cacheInstance.addCacheAttribute({
      imageAttributes: testImageAttributes,
      imageCacheKey: testImageCacheKey,
    });

    expect(mockExistsSync).toBeCalledWith(mockProcessedImageMetaDataFilePath);
    expect(cacheInstance.currentCache).toEqual({
      [testImageCacheKey]: testImageAttributes,
    });
    expect(mockWriteFileSync).not.toBeCalled();
  });

  it('will append a new image meta data field by unique key', async () => {
    mockExistsSync.mockReturnValueOnce(true);

    const { processedImageMetaDataCache: cacheInstance } = await import(
      './processed-image-cache'
    );

    const newMetadata = { imageHash: 'qwerty' };
    const newUniqueKey = 'baz';

    cacheInstance.addCacheAttribute({
      imageAttributes: newMetadata,
      imageCacheKey: newUniqueKey,
    });

    expect(cacheInstance.currentCache).toEqual({
      ...initialValueMetaDataJson,
      [newUniqueKey]: newMetadata,
    });
  });

  it('will save the current cache to the file system on saveCacheToFileSystem', async () => {
    mockExistsSync.mockReturnValueOnce(true);

    const { processedImageMetaDataCache: cacheInstance } = await import(
      './processed-image-cache'
    );

    const newMetadata = { imageHash: 'qwerty' };
    const newUniqueKey = 'baz';

    cacheInstance.saveCacheToFileSystem();

    expect(mockWriteFileSync).toBeCalledWith(
      mockProcessedImageMetaDataFilePath,
      JSON.stringify(initialValueMetaDataJson, undefined, 2),
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
          ...initialValueMetaDataJson,
          [newUniqueKey]: newMetadata,
        },
        undefined,
        2,
      ),
    ]);
  });

  it('will gracefully catch errors on attempted parsing of file and remove corrupted file', async () => {
    mockExistsSync.mockReturnValueOnce(true);
    mockReadFileSync.mockImplementationOnce(() =>
      Buffer.from('I am not an object'),
    );

    const { processedImageMetaDataCache: cacheInstance } = await import(
      './processed-image-cache'
    );

    const newMetadata = { imageHash: 'qwerty' };
    const newUniqueKey = 'baz';

    cacheInstance.addCacheAttribute({
      imageAttributes: newMetadata,
      imageCacheKey: newUniqueKey,
    });

    expect(mockThrownExceptionToLoggerAsError).toBeCalledWith(
      new SyntaxError('Unexpected token I in JSON at position 0'),
      `Unable to retrieve and parse data from "${mockProcessedImageMetaDataFilePath}". Removing as likely corrupted`,
    );
  });
});
