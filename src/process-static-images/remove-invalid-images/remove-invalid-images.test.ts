import { existsSync, promises as fsPromises } from 'fs';

import {
  localDeveloperImageCache,
  processedImageMetaDataCache,
} from '../../caching';

import { removeInvalidImages } from './remove-invalid-images';

jest.mock('../../caching', () => {
  const mockLocalDevelopmentRemoveCacheAttribute = jest.fn();
  const mockProcessedImageRemoveCacheAttribute = jest.fn();

  return {
    localDeveloperImageCache: {
      removeCacheAttribute: mockLocalDevelopmentRemoveCacheAttribute,
    },
    processedImageMetaDataCache: {
      removeCacheAttribute: mockProcessedImageRemoveCacheAttribute,
    },
  };
});

jest.mock('fs', () => {
  const mockFsExistsSync = jest.fn().mockReturnValue(false);
  const mockDirentName = '100';
  const mockFsPromisesUnlink = jest.fn();

  return {
    existsSync: mockFsExistsSync,
    promises: {
      readdir: jest.fn().mockResolvedValue([
        {
          isDirectory: () => true, // This will be overridden in tests
          name: mockDirentName,
        },
      ]),
      unlink: mockFsPromisesUnlink,
    },
  };
});

jest.mock('../../static-image-config', () => {
  return {
    imageFormat: {
      png: 'png',
    },
  };
});

jest.mock('../process-static-image-constants', () => {
  const mockThumbnailFileExtension = 'qwerty';

  return {
    thumbnailFileExtension: mockThumbnailFileExtension,
  };
});

jest.mock('../../constants', () => {
  const mockRootPublicImageDirectory = 'foo';
  const mockThumbnailDirectoryPath = 'bar';

  return {
    rootPublicImageDirectory: mockRootPublicImageDirectory,
    thumbnailDirectoryPath: mockThumbnailDirectoryPath,
  };
});

const mockFsExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockFsPromisesUnlink = fsPromises.unlink as jest.MockedFunction<
  typeof fsPromises.unlink
>;
const mockLocalDevelopmentRemoveCacheAttribute =
  localDeveloperImageCache.removeCacheAttribute as jest.MockedFunction<
    typeof localDeveloperImageCache.removeCacheAttribute
  >;
const mockProcessedImageRemoveCacheAttribute =
  processedImageMetaDataCache.removeCacheAttribute as jest.MockedFunction<
    typeof processedImageMetaDataCache.removeCacheAttribute
  >;

// Create a reference to the dirent mock that we can control in tests
const mockDirentIsDirectory = jest.fn().mockReturnValue(true);

// Test constants
const mockDirentName = '100';
const mockRootPublicImageDirectory = 'foo';
const mockThumbnailDirectoryPath = 'bar';
const mockThumbnailFileExtension = 'qwerty';

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
  beforeEach(() => {
    // Set up the fs.promises.readdir mock to return our controllable dirent
    const mockFsPromisesReaddir = fsPromises.readdir as jest.MockedFunction<
      typeof fsPromises.readdir
    >;
    mockFsPromisesReaddir.mockResolvedValue([
      {
        isDirectory: mockDirentIsDirectory,
        name: mockDirentName,
      } as any,
    ]);
  });

  it('will call to remove local cache attribute of each invalid image', async () => {
    await removeInvalidImages(mockInvalidImages);
    expect(mockLocalDevelopmentRemoveCacheAttribute).toHaveBeenCalledTimes(
      mockInvalidImages.length,
    );
    expect(mockLocalDevelopmentRemoveCacheAttribute).toHaveBeenCalledWith(
      mockInvalidImages[0].name,
    );
    expect(mockLocalDevelopmentRemoveCacheAttribute).toHaveBeenCalledWith(
      mockInvalidImages[1].name,
    );
  });

  it('will call to remove processed image meta data cache attribute of each invalid image', async () => {
    await removeInvalidImages(mockInvalidImages);
    expect(mockProcessedImageRemoveCacheAttribute).toHaveBeenCalledTimes(
      mockInvalidImages.length,
    );
    expect(mockProcessedImageRemoveCacheAttribute).toHaveBeenCalledWith(
      mockInvalidImages[0].name,
    );
    expect(mockProcessedImageRemoveCacheAttribute).toHaveBeenCalledWith(
      mockInvalidImages[1].name,
    );
  });

  it('will not check if each image exists in the public directory if all child dirents are not directories', async () => {
    mockDirentIsDirectory.mockReturnValueOnce(false).mockReturnValueOnce(false);
    await removeInvalidImages(mockInvalidImages);
    expect(mockFsExistsSync).toHaveBeenCalledTimes(2);
    expect(mockFsExistsSync).not.toHaveBeenCalledWith(imageOnePath);
  });

  it('will check if each image exists in all child dirents that are directories of the static image public directory', async () => {
    await removeInvalidImages(mockInvalidImages);
    expect(mockFsExistsSync).toHaveBeenCalledTimes(4);
    expect(mockFsExistsSync).toHaveBeenCalledWith(imageOnePath);
    expect(mockFsExistsSync).toHaveBeenCalledWith(imageTwoPath);
    expect(mockFsPromisesUnlink).not.toHaveBeenCalled();
  });

  it('will request to remove optimised images if it finds them in the static image public directory', async () => {
    mockFsExistsSync
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);
    await removeInvalidImages(mockInvalidImages);
    expect(mockFsPromisesUnlink).toHaveBeenCalledWith(imageOnePath);
    expect(mockFsPromisesUnlink).toHaveBeenCalledWith(imageTwoPath);
  });

  it('will check if a thumbnail exists for each image', async () => {
    await removeInvalidImages(mockInvalidImages);
    expect(mockFsExistsSync).toHaveBeenCalledWith(
      `${mockThumbnailDirectoryPath}/${mockInvalidImages[0].name}.${mockThumbnailFileExtension}`,
    );
    expect(mockFsExistsSync).toHaveBeenCalledWith(
      `${mockThumbnailDirectoryPath}/${mockInvalidImages[1].name}.${mockThumbnailFileExtension}`,
    );
    expect(mockFsPromisesUnlink).not.toHaveBeenCalled();
  });

  it('will request to delete thumbnail file if exists for each image', async () => {
    mockFsExistsSync.mockReturnValue(true);
    await removeInvalidImages(mockInvalidImages);
    expect(mockFsPromisesUnlink).toHaveBeenCalledWith(
      `${mockThumbnailDirectoryPath}/${mockInvalidImages[0].name}.${mockThumbnailFileExtension}`,
    );
    expect(mockFsPromisesUnlink).toHaveBeenCalledWith(
      `${mockThumbnailDirectoryPath}/${mockInvalidImages[1].name}.${mockThumbnailFileExtension}`,
    );
  });
});
