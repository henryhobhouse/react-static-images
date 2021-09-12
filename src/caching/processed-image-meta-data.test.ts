const initialValueMetaDataJson = { foo: 'bar' };
const mockReadFileSync = jest
  .fn()
  .mockImplementation(() =>
    Buffer.from(JSON.stringify(initialValueMetaDataJson)),
  );
const mockWriteFileSync = jest.fn();
const mockExistsSync = jest.fn();
const mockProcessedImageMetaDataFilePath = '/foo/bar';

import { upsertProcessedImageMetaData } from './processed-image-meta-data';

jest.mock('fs', () => ({
  existsSync: mockExistsSync,
  readFileSync: mockReadFileSync,
  writeFileSync: mockWriteFileSync,
}));

jest.mock('./constants', () => ({
  processedImageMetaDataFilePath: mockProcessedImageMetaDataFilePath,
}));

describe('Processed image meta data caching', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upsertProcessedImageMetaData', () => {
    it('will attempt to create a new meta data file with empty object if one does not exist', () => {
      mockExistsSync.mockReturnValueOnce(false);

      upsertProcessedImageMetaData({
        imageAttributes: { imageHash: '' },
        imageCacheKey: '',
      });

      expect(mockExistsSync).toBeCalledWith(mockProcessedImageMetaDataFilePath);
      expect(mockWriteFileSync.mock.calls[0]).toEqual([
        mockProcessedImageMetaDataFilePath,
        '{}',
      ]);
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
  });
});
