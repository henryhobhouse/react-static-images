const mockInfoLogger = jest.fn();
const mockLogLogger = jest.fn();
const mockWarnLogger = jest.fn();
const mockTotalImagesCached = 12;
const mockTotalImagesFound = 45;
const mockGetImageMetaData = jest.fn().mockReturnValue({
  imageFilesMetaData: [],
  invalidCachedImages: [],
  totalImagesCached: mockTotalImagesCached,
  totalImagesFound: mockTotalImagesFound,
});
const mockProgressBarStart = jest.fn();
const mockProgressBarStop = jest.fn();
const mockProgressBar = jest.fn().mockReturnValue({
  start: mockProgressBarStart,
  stop: mockProgressBarStop,
});
const mockOptimiseImages = jest
  .fn()
  .mockImplementation(() => Promise.resolve());
const mockThrownExceptionToLoggerAsError = jest.fn();
const mockValidateOptimisedImageDirectories = jest.fn();
const mockOptimisedImageSizes = [23, 34];
const mockRootPublicImageDirectory = 'foo';
const mockThumbnailDirectoryPath = 'bar';
const mockStaticImageMetaDirectoryPath = 'baz';
const mockLocalCacheDirectoryPath = 'laurie';
const mockOriginalImageDirectoryPath = 'qwerty';
const mockIsCurrentConfigMatchingCache = jest.fn().mockReturnValue(true);
const mockClearFileSystemCache = jest.fn();
const mockUpdateImageMetaDataCache = jest.fn();
const mockSaveLocalDevelopmentCache = jest.fn();
const mockSaveImageMetaDataCache = jest.fn();
const mockSaveConfigToCache = jest.fn();
const mockRemoveInvalidImages = jest.fn();

import VError from 'verror';

import type { ImageFileSystemMetaData } from './image-files-meta-data';
import { processStaticImages } from './process-static-images';

jest.mock('../logger', () => ({
  logger: {
    info: mockInfoLogger,
    log: mockLogLogger,
    warn: mockWarnLogger,
  },
}));

jest.mock('../constants', () => ({
  originalImageDirectoryPath: mockOriginalImageDirectoryPath,
  rootPublicImageDirectory: mockRootPublicImageDirectory,
  staticImageMetaDirectoryPath: mockStaticImageMetaDirectoryPath,
  thumbnailDirectoryPath: mockThumbnailDirectoryPath,
}));

jest.mock('../static-image-config', () => ({
  getStaticImageConfig: jest.fn().mockReturnValue({
    optimisedImageSizes: mockOptimisedImageSizes,
    staticImageMetaDirectory: 'foo/bar',
  }),
}));

jest.mock('../utils/thrown-exception', () => ({
  thrownExceptionToLoggerAsError: mockThrownExceptionToLoggerAsError,
}));

jest.mock('./image-files-meta-data', () => ({
  getImageFilesMetaData: mockGetImageMetaData,
}));

jest.mock('../cli-progress-bar', () => ({
  cliProgressBar: {
    getInstance: jest.fn(),
    instantiateInstance: mockProgressBar,
  },
}));

jest.mock('../utils/validate-required-directory-paths', () => ({
  validateRequiredDirectoryPaths: mockValidateOptimisedImageDirectories,
}));

jest.mock('./optimise-images', () => ({
  optimiseImages: mockOptimiseImages,
}));

jest.mock('../caching', () => ({
  clearFileSystemCache: mockClearFileSystemCache,
  isCurrentConfigMatchingCache: mockIsCurrentConfigMatchingCache,
  localCacheDirectoryPath: mockLocalCacheDirectoryPath,
  localDeveloperImageCache: {
    saveCacheToFileSystem: mockSaveLocalDevelopmentCache,
  },
  processedImageMetaDataCache: {
    saveCacheToFileSystem: mockSaveImageMetaDataCache,
    update: mockUpdateImageMetaDataCache,
  },
  saveCurrentConfigToCache: mockSaveConfigToCache,
}));

jest.mock('./remove-invalid-images', () => ({
  removeInvalidImages: mockRemoveInvalidImages,
}));

describe('processStaticImages', () => {
  afterEach(jest.clearAllMocks);

  it('will request to validate all directories used to store data from processing images', async () => {
    await processStaticImages();
    expect(mockValidateOptimisedImageDirectories).toBeCalledWith({
      directoryPaths: [
        mockThumbnailDirectoryPath,
        mockStaticImageMetaDirectoryPath,
        mockLocalCacheDirectoryPath,
        mockOriginalImageDirectoryPath,
      ],
      optimisedImageSizes: mockOptimisedImageSizes,
      rootPublicImageDirectory: mockRootPublicImageDirectory,
    });
  });

  it('will request to get all images meta data with no arguments', async () => {
    await processStaticImages();
    expect(mockGetImageMetaData).toBeCalledWith();
  });

  it('will log if no images found and exit from the process', async () => {
    const testImagesFound = 4;
    mockGetImageMetaData.mockImplementationOnce(() => ({
      imageFilesMetaData: [],
      totalImagesFound: testImagesFound,
    }));
    await processStaticImages();
    expect(mockInfoLogger.mock.calls.pop()[0]).toBe(
      `Found ${testImagesFound} images in accepted image format`,
    );
  });

  it('will log out how many images need processing when images are found', async () => {
    const mockImageMetaDatas = [{}, {}];
    mockGetImageMetaData.mockImplementationOnce(() => ({
      imageFilesMetaData: mockImageMetaDatas,
      invalidCachedImages: [],
    }));
    await processStaticImages();
    expect(mockInfoLogger.mock.calls[2][0]).toBe(
      `${mockImageMetaDatas.length} images to process. Processing...`,
    );
  });

  it('will instantiate and start a progress bar', async () => {
    const mockImageMetaDatas = [{}, {}];
    mockGetImageMetaData.mockImplementationOnce(() => ({
      imageFilesMetaData: mockImageMetaDatas,
      invalidCachedImages: [],
    }));
    await processStaticImages();
    expect(mockProgressBar).toBeCalledWith({ etaBuffer: 10 });
    expect(mockProgressBarStart).toBeCalledWith(2, 0, { speed: 'N/A' });
  });

  it('will request to optimise images', async () => {
    const mockImageMetaDatas: ImageFileSystemMetaData[] = [
      {
        fileName: 'dom',
        path: '/foo/bar',
        type: 'webp',
        uniqueImageName: 'random',
      },
    ];
    mockGetImageMetaData.mockImplementationOnce(() => ({
      imageFilesMetaData: mockImageMetaDatas,
      invalidCachedImages: [],
    }));
    await processStaticImages();
    expect(mockOptimiseImages).toBeCalledWith({
      imagesFileSystemMetaData: mockImageMetaDatas,
    });
  });

  it('will request to stop the progress bar after completion', async () => {
    const mockImageMetaDatas = [{}, {}];
    mockGetImageMetaData.mockImplementationOnce(() => ({
      imageFilesMetaData: mockImageMetaDatas,
      invalidCachedImages: [],
    }));
    await processStaticImages();

    expect(mockProgressBarStop).toBeCalledWith();
    expect(mockThrownExceptionToLoggerAsError).not.toBeCalled();
  });

  it('will log out a success message', async () => {
    const mockImageMetaDatas = [{}, {}];
    mockGetImageMetaData.mockImplementationOnce(() => ({
      imageFilesMetaData: mockImageMetaDatas,
      invalidCachedImages: [],
    }));
    await processStaticImages();

    expect(mockLogLogger).toBeCalledWith(
      'success',
      'All available images processed successfully.',
    );
  });

  it('will request to stop the progress bar after exception is thrown after its been instantiated', async () => {
    mockOptimiseImages.mockImplementationOnce(() => {
      throw new Error('oppsies');
    });
    mockGetImageMetaData.mockImplementationOnce(() => ({
      imageFilesMetaData: [{}, {}],
      invalidCachedImages: [],
    }));

    await processStaticImages();

    expect(mockProgressBarStop).toBeCalledWith();
  });

  it('will not request to stop the progress bar after exception is thrown before its been instantiated', async () => {
    mockGetImageMetaData.mockImplementationOnce(() => {
      throw new Error('oppsies');
    });

    await processStaticImages();

    expect(mockProgressBarStop).not.toBeCalled();
  });

  it('will request to log our error on exception been thrown', async () => {
    const testErrorMessage = 'oppsies';
    mockOptimiseImages.mockImplementationOnce(() => {
      throw new Error(testErrorMessage);
    });
    mockGetImageMetaData.mockImplementationOnce(() => ({
      imageFilesMetaData: [{}, {}],
      invalidCachedImages: [],
    }));

    await processStaticImages();

    expect(mockThrownExceptionToLoggerAsError).toBeCalledWith(
      new VError(testErrorMessage),
      'Error processing Images',
    );
  });

  it('will log out how many images were found and cached', async () => {
    await processStaticImages();

    expect(mockInfoLogger).toBeCalledWith(
      `Found ${mockTotalImagesFound} images in accepted image format`,
    );

    expect(mockInfoLogger).toBeCalledWith(
      `${mockTotalImagesCached} of those have valid cache present`,
    );
  });

  it('will log a warning if current config does not match cache', async () => {
    mockIsCurrentConfigMatchingCache.mockReturnValueOnce(false);
    await processStaticImages();
    expect(mockWarnLogger).toBeCalledWith(
      'Config has been changed since last time. Clearing cache and re-processing using new config',
    );
  });

  it('will request to clear file system cache if current config does not match cache', async () => {
    mockIsCurrentConfigMatchingCache.mockReturnValueOnce(false);
    await processStaticImages();
    expect(mockClearFileSystemCache).toBeCalledWith();
  });

  it('will request to update local processed image cache if current config does not match cache', async () => {
    mockIsCurrentConfigMatchingCache.mockReturnValueOnce(false);
    await processStaticImages();
    expect(mockUpdateImageMetaDataCache).toBeCalledWith();
  });

  it('will request to save local developer cache on successfully processing images', async () => {
    const mockImageMetaDatas = [{}, {}];
    mockGetImageMetaData.mockImplementationOnce(() => ({
      imageFilesMetaData: mockImageMetaDatas,
      invalidCachedImages: [],
    }));
    await processStaticImages();
    expect(mockSaveLocalDevelopmentCache).toBeCalledWith();
  });

  it('will request to save image meta data cache on successfully processing images', async () => {
    const mockImageMetaDatas = [{}, {}];
    mockGetImageMetaData.mockImplementationOnce(() => ({
      imageFilesMetaData: mockImageMetaDatas,
      invalidCachedImages: [],
    }));
    await processStaticImages();
    expect(mockSaveImageMetaDataCache).toBeCalledWith();
  });

  it('will request to save config to cache on successfully processing images', async () => {
    const mockImageMetaDatas = [{}, {}];
    mockGetImageMetaData.mockImplementationOnce(() => ({
      imageFilesMetaData: mockImageMetaDatas,
      invalidCachedImages: [],
    }));
    await processStaticImages();
    expect(mockSaveConfigToCache).toBeCalledWith();
  });

  it('will log out if get image meta data finds images in cache that are no longer used', async () => {
    const testInvalidCachedImages = [{}, {}];
    mockGetImageMetaData.mockReturnValue({
      imageFilesMetaData: [],
      invalidCachedImages: testInvalidCachedImages,
      totalImagesCached: mockTotalImagesCached,
      totalImagesFound: mockTotalImagesFound,
    });
    await processStaticImages();

    expect(mockInfoLogger).toBeCalledWith(
      `Found ${testInvalidCachedImages.length} images in cache no longer used. Deleting from cache`,
    );
  });

  it('will request to remove invalid images that are no longer used', async () => {
    const testInvalidCachedImages = [{ foo: 'bar' }, {}];
    mockGetImageMetaData.mockReturnValue({
      imageFilesMetaData: [],
      invalidCachedImages: testInvalidCachedImages,
      totalImagesCached: mockTotalImagesCached,
      totalImagesFound: mockTotalImagesFound,
    });
    await processStaticImages();

    expect(mockRemoveInvalidImages).toBeCalledWith(testInvalidCachedImages);
  });
});
