const mockLocalDevelopmentRemoveCacheAttribute = jest.fn();
const mockProcessedImageRemoveCacheAttribute = jest.fn();
const mockFsExistsSync = jest.fn().mockReturnValue(false);
const mockDirentIsDirectory = jest.fn().mockReturnValue(true);
const mockDirentName = '100';
const mockRootPublicImageDirectory = 'foo';
const mockFsPromisesUnlink = jest.fn();
const mockThumbnailDirectoryPath = 'bar';
const mockThumbnailFileExtension = 'qwerty';

import { removeInvalidImages } from './remove-invalid-images';

jest.mock('../../caching', () => ({
  localDeveloperImageCache: {
    removeCacheAttribute: mockLocalDevelopmentRemoveCacheAttribute,
  },
  processedImageMetaDataCache: {
    removeCacheAttribute: mockProcessedImageRemoveCacheAttribute,
  },
}));

jest.mock('fs', () => ({
  existsSync: mockFsExistsSync,
  promises: {
    readdir: jest.fn().mockResolvedValue([
      {
        isDirectory: mockDirentIsDirectory,
        name: mockDirentName,
      },
    ]),
    unlink: mockFsPromisesUnlink,
  },
}));

jest.mock('../../static-image-config', () => ({
  imageFormat: {
    png: 'png',
  },
}));

jest.mock('../process-static-image-constants', () => ({
  thumbnailFileExtension: mockThumbnailFileExtension,
}));

jest.mock('../../constants', () => ({
  rootPublicImageDirectory: mockRootPublicImageDirectory,
  thumbnailDirectoryPath: mockThumbnailDirectoryPath,
}));

const mockInvalidImages = [
  {
    hash: 'hash',
    name: 'foggy',
  },
  {
    hash: 'johnson',
    name: 'baz',
  },
];

const imageOnePath = `${mockRootPublicImageDirectory}/${mockDirentName}/${mockInvalidImages[0].hash}${mockInvalidImages[0].name}.png`;
const imageTwoPath = `${mockRootPublicImageDirectory}/${mockDirentName}/${mockInvalidImages[1].hash}${mockInvalidImages[1].name}.png`;

describe('removeInvalidImages', () => {
  afterEach(jest.clearAllMocks);

  it('will call to remove local cache attribute of each invalid image', async () => {
    await removeInvalidImages(mockInvalidImages);
    expect(mockLocalDevelopmentRemoveCacheAttribute).toBeCalledTimes(
      mockInvalidImages.length,
    );
    expect(mockLocalDevelopmentRemoveCacheAttribute).toBeCalledWith(
      mockInvalidImages[0].name,
    );
    expect(mockLocalDevelopmentRemoveCacheAttribute).toBeCalledWith(
      mockInvalidImages[1].name,
    );
  });

  it('will call to remove processed image meta data cache attribute of each invalid image', async () => {
    await removeInvalidImages(mockInvalidImages);
    expect(mockProcessedImageRemoveCacheAttribute).toBeCalledTimes(
      mockInvalidImages.length,
    );
    expect(mockProcessedImageRemoveCacheAttribute).toBeCalledWith(
      mockInvalidImages[0].name,
    );
    expect(mockProcessedImageRemoveCacheAttribute).toBeCalledWith(
      mockInvalidImages[1].name,
    );
  });

  it('will not check if each image exists in the public directory if all child dirents are not directories', async () => {
    mockDirentIsDirectory.mockReturnValueOnce(false).mockReturnValueOnce(false);
    await removeInvalidImages(mockInvalidImages);
    expect(mockFsExistsSync).toBeCalledTimes(2);
    expect(mockFsExistsSync).not.toBeCalledWith(imageOnePath);
  });

  it('will check if each image exists in all child dirents that are directories of the static image public directory', async () => {
    await removeInvalidImages(mockInvalidImages);
    expect(mockFsExistsSync).toBeCalledTimes(4);
    expect(mockFsExistsSync).toBeCalledWith(imageOnePath);
    expect(mockFsExistsSync).toBeCalledWith(imageTwoPath);
    expect(mockFsPromisesUnlink).not.toBeCalled();
  });

  it('will request to remove optimised images if it finds them in the static image public directory', async () => {
    mockFsExistsSync
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);
    await removeInvalidImages(mockInvalidImages);
    expect(mockFsPromisesUnlink).toBeCalledWith(imageOnePath);
    expect(mockFsPromisesUnlink).toBeCalledWith(imageTwoPath);
  });

  it('will check if a thumbnail exists for each image', async () => {
    await removeInvalidImages(mockInvalidImages);
    expect(mockFsExistsSync).toBeCalledWith(
      `${mockThumbnailDirectoryPath}/${mockInvalidImages[0].name}.${mockThumbnailFileExtension}`,
    );
    expect(mockFsExistsSync).toBeCalledWith(
      `${mockThumbnailDirectoryPath}/${mockInvalidImages[1].name}.${mockThumbnailFileExtension}`,
    );
    expect(mockFsPromisesUnlink).not.toBeCalled();
  });

  it('will request to delete thumbnail file if exists for each image', async () => {
    mockFsExistsSync.mockReturnValue(true);
    await removeInvalidImages(mockInvalidImages);
    expect(mockFsPromisesUnlink).toBeCalledWith(
      `${mockThumbnailDirectoryPath}/${mockInvalidImages[0].name}.${mockThumbnailFileExtension}`,
    );
    expect(mockFsPromisesUnlink).toBeCalledWith(
      `${mockThumbnailDirectoryPath}/${mockInvalidImages[1].name}.${mockThumbnailFileExtension}`,
    );
  });
});
