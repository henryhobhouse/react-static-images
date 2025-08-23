const mockGetFileContentShortHashByPath = jest.fn();
const mockLastUpdatedTime = 12_345;
const mockFsStats = jest.fn().mockReturnValue({
  mtimeMs: mockLastUpdatedTime,
});

jest.mock('../../utils/data-fingerprinting', () => ({
  getFileContentShortHashByPath: mockGetFileContentShortHashByPath,
}));

jest.mock('../../caching', () => ({
  localDeveloperImageCache: {
    currentDevCache: {},
  },
  processedImageMetaDataCache: {
    currentCache: {},
  },
}));

jest.mock('fs', () => ({
  promises: {
    stat: mockFsStats,
  },
}));

describe('validateImageCache', () => {
  afterEach(() => {
    jest.resetModules();
  });

  it('will return false when there is no existing processed image meta data', async () => {
    const { validateImageCached: validateImageCache } = await import(
      './validate-image-cached'
    );
    const response = await validateImageCache('', '');

    expect(response).toBeFalsy();
    expect(mockGetFileContentShortHashByPath).not.toHaveBeenCalled();
  });

  it('will return false when existing processed image meta data has no property key matching the image CacheKey', async () => {
    jest.mock('../../caching', () => ({
      localDeveloperImageCache: {
        currentDevCache: {},
      },
      processedImageMetaDataCache: {
        currentCache: { foo: {} },
      },
    }));

    const { validateImageCached: validateImageCache } = await import(
      './validate-image-cached'
    );

    const response = await validateImageCache('', 'baz');

    expect(response).toBeFalsy();
    expect(mockGetFileContentShortHashByPath).not.toHaveBeenCalled();
  });

  it('will return false when existing processed image meta data has cache but miss matched content hash', async () => {
    const testFilePath = '/pot/a/toe';
    mockGetFileContentShortHashByPath.mockImplementation(() =>
      Promise.resolve('aaa'),
    );
    const testImageCacheKey = 'baz';
    jest.mock('../../caching', () => ({
      localDeveloperImageCache: {
        currentDevCache: {},
      },
      processedImageMetaDataCache: {
        currentCache: { [testImageCacheKey]: { imageHash: 'bbb' } },
      },
    }));

    const { validateImageCached: validateImageCache } = await import(
      './validate-image-cached'
    );

    const response = await validateImageCache(testFilePath, testImageCacheKey);

    expect(response).toBeFalsy();
    expect(mockGetFileContentShortHashByPath).toHaveBeenCalledWith(
      testFilePath,
    );
  });

  it('will return true when existing processed image meta data has cache and matching content hash', async () => {
    const testFilePath = '/pot/a/toe';
    const testImageContentHash = 'qwerty';
    const testImageCacheKey = 'baz';
    mockGetFileContentShortHashByPath.mockImplementation(() =>
      Promise.resolve(testImageContentHash),
    );

    jest.mock('../../caching', () => ({
      localDeveloperImageCache: {
        addCacheAttribute: jest.fn(),
        currentDevCache: {},
      },
      processedImageMetaDataCache: {
        currentCache: {
          [testImageCacheKey]: { imageHash: testImageContentHash },
        },
      },
    }));

    const { validateImageCached: validateImageCache } = await import(
      './validate-image-cached'
    );

    const response = await validateImageCache(testFilePath, testImageCacheKey);

    expect(response).toBeTruthy();
    expect(mockGetFileContentShortHashByPath).toHaveBeenCalledWith(
      testFilePath,
    );
  });

  it('will return true local dev cache last updated time matches stats from image', async () => {
    const testFilePath = '/pot/a/toe';
    const testImageContentHash = 'qwerty';
    const testImageCacheKey = 'baz';
    mockGetFileContentShortHashByPath.mockImplementation(() =>
      Promise.resolve(testImageContentHash),
    );

    jest.mock('../../caching', () => ({
      localDeveloperImageCache: {
        currentDevCache: {
          [testImageCacheKey]: mockLastUpdatedTime,
        },
      },
      processedImageMetaDataCache: {
        currentCache: {
          foo: 'bar',
        },
      },
    }));

    const { validateImageCached: validateImageCache } = await import(
      './validate-image-cached'
    );

    const response = await validateImageCache(testFilePath, testImageCacheKey);

    expect(response).toBeTruthy();
    expect(mockGetFileContentShortHashByPath).not.toHaveBeenCalled();
  });
});
