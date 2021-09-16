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

import {
  upsertProcessedImageMetaData,
  getProcessedImageMetaData,
} from './processed-image-meta-data';

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

describe('Processed image meta data caching', () => {
  afterEach(jest.clearAllMocks);

  describe('upsertProcessedImageMetaData', () => {
    it('will attempt to create a new meta data file with new attributes if one does not exist', () => {
      mockExistsSync.mockReturnValueOnce(false);

      const testImageCacheKey = 'baz';
      const testImageAttributes = { imageHash: '' };

      upsertProcessedImageMetaData({
        imageAttributes: testImageAttributes,
        imageCacheKey: testImageCacheKey,
      });

      expect(mockExistsSync).toBeCalledWith(mockProcessedImageMetaDataFilePath);
      expect(mockWriteFileSync).toBeCalledWith(
        mockProcessedImageMetaDataFilePath,
        JSON.stringify(
          { [testImageCacheKey]: testImageAttributes },
          undefined,
          2,
        ),
      );
    });

    it('will append a new image meta data field by unique key', () => {
      mockExistsSync.mockReturnValueOnce(true);

      const newMetadata = { imageHash: 'qwerty' };
      const newUniqueKey = 'baz';

      upsertProcessedImageMetaData({
        imageAttributes: newMetadata,
        imageCacheKey: newUniqueKey,
      });

      expect(mockWriteFileSync).toBeCalledWith(
        mockProcessedImageMetaDataFilePath,
        JSON.stringify(
          {
            ...initialValueMetaDataJson,
            [newUniqueKey]: newMetadata,
          },
          undefined,
          2,
        ),
      );
    });

    it('will gracefully catch errors on attempted parsing of file and remove corrupted file', () => {
      mockExistsSync.mockReturnValueOnce(true);
      mockReadFileSync.mockImplementationOnce(() =>
        Buffer.from('I am not an object'),
      );

      const newMetadata = { imageHash: 'qwerty' };
      const newUniqueKey = 'baz';

      upsertProcessedImageMetaData({
        imageAttributes: newMetadata,
        imageCacheKey: newUniqueKey,
      });

      expect(mockThrownExceptionToLoggerAsError).toBeCalledWith(
        new Error('Unexpected token I in JSON at position 0'),
        `Unable to parse "${mockProcessedImageMetaDataFilePath}". Removing as likely corrupted`,
      );
    });
  });

  describe('getProcessedImageMetaData', () => {
    it('will returned the parsed contents of the processed image meta data file if exists', () => {
      mockExistsSync.mockReturnValueOnce(true);

      expect(getProcessedImageMetaData()).toEqual(initialValueMetaDataJson);
    });

    it('will return undefined if the processed image meta data file does not exist', () => {
      mockExistsSync.mockReturnValueOnce(false);

      expect(getProcessedImageMetaData()).toEqual(undefined);
    });
  });
});
