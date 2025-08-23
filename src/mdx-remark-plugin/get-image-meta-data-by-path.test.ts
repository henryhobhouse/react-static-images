const mockUniqueName = 'abracadabra';
const mockImageMetaData = 'rocking robin';
const mockCreateUniqueFileNameFromPath = jest
  .fn()
  .mockReturnValue(mockUniqueName);
const mockCurrentWorkingDirectory = 'foo';
const mockImagesBaseDirectory = 'bar';
const mockThumbnailBase64 = 'qwerty';
const mockReadFileSync = jest
  .fn()
  .mockImplementation(() => Buffer.from(mockThumbnailBase64));
const mockThrownExceptionToLoggerAsError = jest.fn();

import { getImageMetaDataByPath } from './get-image-meta-data-by-path';

jest.mock('../caching', () => ({
  processedImageMetaDataCache: {
    currentCache: {
      [mockUniqueName]: { imageHash: mockImageMetaData },
    },
  },
}));

jest.mock('../utils/thrown-exception', () => ({
  thrownExceptionToLoggerAsError: mockThrownExceptionToLoggerAsError,
}));

jest.mock('../constants', () => ({
  currentWorkingDirectory: mockCurrentWorkingDirectory,
  imagesBaseDirectory: mockImagesBaseDirectory,
  thumbnailDirectoryPath: 'baz',
}));

jest.mock('../utils/data-fingerprinting', () => ({
  createUniqueFileNameFromPath: mockCreateUniqueFileNameFromPath,
}));

jest.mock('fs', () => ({
  readFileSync: mockReadFileSync,
}));

describe('getImageMetaDataByPath', () => {
  afterEach(jest.clearAllMocks);

  it('will consider image path with path separator prefix as absolute from base image directory from config', () => {
    const testAbsoluteImagePath = '/baz/test/ping.png';
    getImageMetaDataByPath(testAbsoluteImagePath, '/qwerty');
    expect(mockCreateUniqueFileNameFromPath.mock.calls[0][0]).toBe(
      `${mockImagesBaseDirectory}${testAbsoluteImagePath}`,
    );
  });

  it('will consider image path with out path separator prefix as relative from nodeFileDirectoryPath', () => {
    const testNodeFileDirectoryPath = '/qwerty';
    const testRelativeImagePath = 'test/ping.png';
    getImageMetaDataByPath(testRelativeImagePath, testNodeFileDirectoryPath);
    expect(mockCreateUniqueFileNameFromPath.mock.calls[0][0]).toBe(
      `${testNodeFileDirectoryPath}/${testRelativeImagePath}`,
    );
  });

  it('will remove current working directory path from relative path if present', () => {
    const testNodeFileDirectoryPath = '/qwerty';
    const testRelativeImagePath = 'test/ping.png';
    getImageMetaDataByPath(
      testRelativeImagePath,
      `${mockCurrentWorkingDirectory}${testNodeFileDirectoryPath}`,
    );
    expect(mockCreateUniqueFileNameFromPath.mock.calls[0][0]).toBe(
      `${testNodeFileDirectoryPath}/${testRelativeImagePath}`,
    );
  });

  it('will parse file name, without extension, to use to get unique name', () => {
    getImageMetaDataByPath('/baz/test/ping.png', '/qwerty');
    expect(mockCreateUniqueFileNameFromPath.mock.calls[0][1]).toBe('ping');
  });

  it('will use the returned unique file name to access the images cache', () => {
    const response = getImageMetaDataByPath('/baz/test/ping.png', '/qwerty');
    expect(mockCreateUniqueFileNameFromPath).toHaveBeenCalledTimes(1);
    expect(response?.uniqueName).toBe(mockUniqueName);
    expect(response?.imageHash).toBe(mockImageMetaData);
  });

  it('will return the base 64 string for the placeholder image', () => {
    const response = getImageMetaDataByPath('/baz/test/ping.png', '/qwerty');
    expect(response?.placeholderBase64).toBe(mockThumbnailBase64);
    expect(mockThrownExceptionToLoggerAsError).not.toHaveBeenCalled();
  });

  it('will return an empty string for the base 64 placeholder image, and log issue, on error retrieving file', () => {
    const testError = 'oppises';
    mockReadFileSync.mockImplementationOnce(() => {
      throw new Error(testError);
    });
    const response = getImageMetaDataByPath('/baz/test/ping.png', '/qwerty');
    expect(response?.placeholderBase64).toBe('');
    expect(mockThrownExceptionToLoggerAsError).toHaveBeenCalledWith(
      new Error(testError),
      `Unable to get image thumbnail for path ${mockUniqueName}`,
    );
  });

  it('will return undefined if cannot find meta data from cache', async () => {
    jest.resetModules();
    jest.mock('../caching', () => ({
      processedImageMetaDataCache: {
        currentCache: {},
      },
    }));

    const { getImageMetaDataByPath } = await import(
      './get-image-meta-data-by-path'
    );
    const response = getImageMetaDataByPath('/baz/test/ping.png', '/qwerty');
    expect(response).toBeUndefined();

    jest.resetModules();
  });
});
