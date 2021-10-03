const mockUniqueName = 'abracadabra';
const mockImageMetaData = 'rocking robin';
const mockCreateUniqueFileNameFromPath = jest
  .fn()
  .mockReturnValue(mockUniqueName);
const mockCurrentWorkingDirectory = 'foo';
const mockImagesBaseDirectory = 'bar';

import { getImageMetaDataByPath } from './get-image-meta-data-by-path';

jest.mock('../caching', () => ({
  processedImageMetaDataCache: {
    currentCache: {
      [mockUniqueName]: mockImageMetaData,
    },
  },
}));

jest.mock('../constants', () => ({
  currentWorkingDirectory: mockCurrentWorkingDirectory,
  imagesBaseDirectory: mockImagesBaseDirectory,
}));

jest.mock('../utils/data-fingerprinting', () => ({
  createUniqueFileNameFromPath: mockCreateUniqueFileNameFromPath,
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
    expect(mockCreateUniqueFileNameFromPath).toBeCalledTimes(1);
    expect(response.uniqueName).toBe(mockUniqueName);
    expect(response.data).toBe(mockImageMetaData);
  });
});
