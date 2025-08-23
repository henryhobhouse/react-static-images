import VError from 'verror';

import {
  isCurrentConfigMatchingCache,
  clearFileSystemCache,
  processedImageMetaDataCache,
  localDeveloperImageCache,
  saveCurrentConfigToCache,
} from '../caching';
import { cliProgressBar } from '../cli-progress-bar';
import { logger } from '../logger';
import { thrownExceptionToLoggerAsError } from '../utils/thrown-exception';
import { validateRequiredDirectoryPaths } from '../utils/validate-required-directory-paths';

import type { ImageFileSystemMetaData } from './image-files-meta-data';
import { getImageFilesMetaData } from './image-files-meta-data';
import { optimiseImages } from './optimise-images';
import { processStaticImages } from './process-static-images';
import { removeInvalidImages } from './remove-invalid-images';

jest.mock('../logger', () => {
  const mockInfoLogger = jest.fn();
  const mockLogLogger = jest.fn();
  const mockWarnLogger = jest.fn();

  return {
    logger: {
      info: mockInfoLogger,
      log: mockLogLogger,
      warn: mockWarnLogger,
    },
  };
});

jest.mock('../constants', () => {
  const mockOriginalImageDirectoryPath = 'qwerty';
  const mockRootPublicImageDirectory = 'foo';
  const mockStaticImageMetaDirectoryPath = 'baz';
  const mockThumbnailDirectoryPath = 'bar';

  return {
    originalImageDirectoryPath: mockOriginalImageDirectoryPath,
    rootPublicImageDirectory: mockRootPublicImageDirectory,
    staticImageMetaDirectoryPath: mockStaticImageMetaDirectoryPath,
    thumbnailDirectoryPath: mockThumbnailDirectoryPath,
  };
});

jest.mock('../static-image-config', () => {
  const mockOptimisedImageSizes = [23, 34];

  return {
    getStaticImageConfig: jest.fn(() => ({
      optimisedImageSizes: mockOptimisedImageSizes,
      staticImageMetaDirectory: 'foo/bar',
    })),
  };
});

jest.mock('../utils/thrown-exception', () => {
  const mockThrownExceptionToLoggerAsError = jest.fn();

  return {
    thrownExceptionToLoggerAsError: mockThrownExceptionToLoggerAsError,
  };
});

jest.mock('./image-files-meta-data', () => {
  const mockTotalImagesCached = 12;
  const mockTotalImagesFound = 45;
  const mockGetImageMetaData = jest.fn(() =>
    Promise.resolve({
      imageFilesMetaData: [],
      invalidCachedImages: [],
      totalImagesCached: mockTotalImagesCached,
      totalImagesFound: mockTotalImagesFound,
    }),
  );

  return {
    getImageFilesMetaData: mockGetImageMetaData,
  };
});

jest.mock('../cli-progress-bar', () => {
  const mockProgressBarStart = jest.fn();
  const mockProgressBarStop = jest.fn();
  const mockProgressBar = jest.fn(() => ({
    start: mockProgressBarStart,
    stop: mockProgressBarStop,
  }));

  return {
    cliProgressBar: {
      getInstance: jest.fn(),
      instantiateInstance: mockProgressBar,
    },
  };
});

jest.mock('../utils/validate-required-directory-paths', () => {
  const mockValidateOptimisedImageDirectories = jest.fn();

  return {
    validateRequiredDirectoryPaths: mockValidateOptimisedImageDirectories,
  };
});

jest.mock('./optimise-images', () => {
  const mockOptimiseImages = jest.fn(() => Promise.resolve());

  return {
    optimiseImages: mockOptimiseImages,
  };
});

jest.mock('../caching', () => {
  const mockIsCurrentConfigMatchingCache = jest.fn(() => true);
  const mockClearFileSystemCache = jest.fn();
  const mockUpdateImageMetaDataCache = jest.fn();
  const mockSaveLocalDevelopmentCache = jest.fn();
  const mockSaveImageMetaDataCache = jest.fn();
  const mockSaveConfigToCache = jest.fn();
  const mockLocalCacheDirectoryPath = 'laurie';

  return {
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
  };
});

jest.mock('./remove-invalid-images', () => {
  const mockRemoveInvalidImages = jest.fn();

  return {
    removeInvalidImages: mockRemoveInvalidImages,
  };
});

const mockInfoLogger = logger.info as jest.MockedFunction<typeof logger.info>;
const mockLogLogger = logger.log as jest.MockedFunction<typeof logger.log>;
const mockWarnLogger = logger.warn as jest.MockedFunction<typeof logger.warn>;
const mockGetImageMetaData = getImageFilesMetaData as jest.MockedFunction<
  typeof getImageFilesMetaData
>;
const mockProgressBar =
  cliProgressBar.instantiateInstance as jest.MockedFunction<
    typeof cliProgressBar.instantiateInstance
  >;
const mockOptimiseImages = optimiseImages as jest.MockedFunction<
  typeof optimiseImages
>;
const mockThrownExceptionToLoggerAsError =
  thrownExceptionToLoggerAsError as jest.MockedFunction<
    typeof thrownExceptionToLoggerAsError
  >;
const mockValidateOptimisedImageDirectories =
  validateRequiredDirectoryPaths as jest.MockedFunction<
    typeof validateRequiredDirectoryPaths
  >;
const mockIsCurrentConfigMatchingCache =
  isCurrentConfigMatchingCache as jest.MockedFunction<
    typeof isCurrentConfigMatchingCache
  >;
const mockClearFileSystemCache = clearFileSystemCache as jest.MockedFunction<
  typeof clearFileSystemCache
>;
const mockUpdateImageMetaDataCache =
  processedImageMetaDataCache.update as jest.MockedFunction<
    typeof processedImageMetaDataCache.update
  >;
const mockSaveLocalDevelopmentCache =
  localDeveloperImageCache.saveCacheToFileSystem as jest.MockedFunction<
    typeof localDeveloperImageCache.saveCacheToFileSystem
  >;
const mockSaveImageMetaDataCache =
  processedImageMetaDataCache.saveCacheToFileSystem as jest.MockedFunction<
    typeof processedImageMetaDataCache.saveCacheToFileSystem
  >;
const mockSaveConfigToCache = saveCurrentConfigToCache as jest.MockedFunction<
  typeof saveCurrentConfigToCache
>;
const mockRemoveInvalidImages = removeInvalidImages as jest.MockedFunction<
  typeof removeInvalidImages
>;

// Get progress bar mock references
const mockProgressBarInstance = { start: jest.fn(), stop: jest.fn() } as any;
const mockProgressBarStart = mockProgressBarInstance.start;
const mockProgressBarStop = mockProgressBarInstance.stop;

// Update the progress bar mock to return our instance
(
  mockProgressBar as jest.MockedFunction<
    typeof cliProgressBar.instantiateInstance
  >
).mockReturnValue(mockProgressBarInstance);

// Test constants
const mockTotalImagesCached = 12;
const mockTotalImagesFound = 45;
const mockOptimisedImageSizes = [23, 34];
const mockRootPublicImageDirectory = 'foo';
const mockThumbnailDirectoryPath = 'bar';
const mockStaticImageMetaDirectoryPath = 'baz';
const mockLocalCacheDirectoryPath = 'laurie';
const mockOriginalImageDirectoryPath = 'qwerty';

describe('processStaticImages', () => {
  beforeEach(() => {
    mockGetImageMetaData.mockResolvedValue({
      imageFilesMetaData: [],
      invalidCachedImages: [],
      totalImagesCached: mockTotalImagesCached,
      totalImagesFound: mockTotalImagesFound,
    });
    mockIsCurrentConfigMatchingCache.mockReturnValue(true);
    mockProgressBar.mockReturnValue(mockProgressBarInstance);
  });

  it('will request to validate all directories used to store data from processing images', async () => {
    await processStaticImages();
    expect(mockValidateOptimisedImageDirectories).toHaveBeenCalledWith({
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
    expect(mockGetImageMetaData).toHaveBeenCalledWith();
  });

  it('will log if no images found and exit from the process', async () => {
    const testImagesFound = 4;
    mockGetImageMetaData.mockResolvedValueOnce({
      imageFilesMetaData: [],
      invalidCachedImages: [],
      totalImagesCached: mockTotalImagesCached,
      totalImagesFound: testImagesFound,
    });
    await processStaticImages();
    expect(mockInfoLogger.mock.calls.pop()![0]).toBe(
      'No new images to process.',
    );
  });

  it('will log out how many images need processing when images are found', async () => {
    const mockImageMetaDatas = [{} as any, {} as any];
    mockGetImageMetaData.mockResolvedValueOnce({
      imageFilesMetaData: mockImageMetaDatas,
      invalidCachedImages: [],
      totalImagesCached: mockTotalImagesCached,
      totalImagesFound: mockTotalImagesFound,
    });
    await processStaticImages();
    expect(mockInfoLogger.mock.calls[3][0]).toBe(
      `${mockImageMetaDatas.length} images to process. Processing...`,
    );
  });

  it('will instantiate and start a progress bar', async () => {
    const mockImageMetaDatas = [{} as any, {} as any];
    mockGetImageMetaData.mockResolvedValueOnce({
      imageFilesMetaData: mockImageMetaDatas,
      invalidCachedImages: [],
      totalImagesCached: mockTotalImagesCached,
      totalImagesFound: mockTotalImagesFound,
    });
    await processStaticImages();
    expect(mockProgressBar).toHaveBeenCalledWith({ etaBuffer: 10 });
    expect(mockProgressBarStart).toHaveBeenCalledWith(2, 0, { speed: 'N/A' });
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
    mockGetImageMetaData.mockResolvedValueOnce({
      imageFilesMetaData: mockImageMetaDatas,
      invalidCachedImages: [],
      totalImagesCached: mockTotalImagesCached,
      totalImagesFound: mockTotalImagesFound,
    });
    await processStaticImages();
    expect(mockOptimiseImages).toHaveBeenCalledWith({
      imagesFileSystemMetaData: mockImageMetaDatas,
    });
  });

  it('will request to stop the progress bar after completion', async () => {
    const mockImageMetaDatas = [{} as any, {} as any];
    mockGetImageMetaData.mockResolvedValueOnce({
      imageFilesMetaData: mockImageMetaDatas,
      invalidCachedImages: [],
      totalImagesCached: mockTotalImagesCached,
      totalImagesFound: mockTotalImagesFound,
    });
    await processStaticImages();

    expect(mockProgressBarStop).toHaveBeenCalledWith();
    expect(mockThrownExceptionToLoggerAsError).not.toHaveBeenCalled();
  });

  it('will log out a success message', async () => {
    const mockImageMetaDatas = [{} as any, {} as any];
    mockGetImageMetaData.mockResolvedValueOnce({
      imageFilesMetaData: mockImageMetaDatas,
      invalidCachedImages: [],
      totalImagesCached: mockTotalImagesCached,
      totalImagesFound: mockTotalImagesFound,
    });
    await processStaticImages();

    expect(mockLogLogger).toHaveBeenCalledWith(
      'success',
      'All available images processed successfully.',
    );
  });

  it('will request to stop the progress bar after exception is thrown after its been instantiated', async () => {
    mockOptimiseImages.mockImplementationOnce(() => {
      throw new Error('oppsies');
    });
    mockGetImageMetaData.mockResolvedValueOnce({
      imageFilesMetaData: [{} as any, {} as any],
      invalidCachedImages: [],
      totalImagesCached: mockTotalImagesCached,
      totalImagesFound: mockTotalImagesFound,
    });

    await processStaticImages();

    expect(mockProgressBarStop).toHaveBeenCalledWith();
  });

  it('will not request to stop the progress bar after exception is thrown before its been instantiated', async () => {
    mockGetImageMetaData.mockRejectedValueOnce(new Error('oppsies'));

    await processStaticImages();

    expect(mockProgressBarStop).not.toHaveBeenCalled();
  });

  it('will request to log our error on exception been thrown', async () => {
    const testErrorMessage = 'oppsies';
    mockOptimiseImages.mockImplementationOnce(() => {
      throw new Error(testErrorMessage);
    });
    mockGetImageMetaData.mockResolvedValueOnce({
      imageFilesMetaData: [{} as any, {} as any],
      invalidCachedImages: [],
      totalImagesCached: mockTotalImagesCached,
      totalImagesFound: mockTotalImagesFound,
    });

    await processStaticImages();

    expect(mockThrownExceptionToLoggerAsError).toHaveBeenCalledWith(
      new VError(testErrorMessage),
      'Error processing Images',
    );
  });

  it('will log out how many images were found and cached', async () => {
    await processStaticImages();

    expect(mockInfoLogger).toHaveBeenCalledWith(
      `Found ${mockTotalImagesFound} images in accepted image format`,
    );

    expect(mockInfoLogger).toHaveBeenCalledWith(
      `${mockTotalImagesCached} of those have valid cache present`,
    );
  });

  it('will log a warning if current config does not match cache', async () => {
    mockIsCurrentConfigMatchingCache.mockReturnValueOnce(false);
    await processStaticImages();
    expect(mockWarnLogger).toHaveBeenCalledWith(
      'Config has been changed since last time. Clearing cache and re-processing using new config',
    );
  });

  it('will request to clear file system cache if current config does not match cache', async () => {
    mockIsCurrentConfigMatchingCache.mockReturnValueOnce(false);
    await processStaticImages();
    expect(mockClearFileSystemCache).toHaveBeenCalledWith();
  });

  it('will request to update local processed image cache if current config does not match cache', async () => {
    mockIsCurrentConfigMatchingCache.mockReturnValueOnce(false);
    await processStaticImages();
    expect(mockUpdateImageMetaDataCache).toHaveBeenCalledWith();
  });

  it('will request to save local developer cache on successfully processing images', async () => {
    const mockImageMetaDatas = [{} as any, {} as any];
    mockGetImageMetaData.mockResolvedValueOnce({
      imageFilesMetaData: mockImageMetaDatas,
      invalidCachedImages: [],
      totalImagesCached: mockTotalImagesCached,
      totalImagesFound: mockTotalImagesFound,
    });
    await processStaticImages();
    expect(mockSaveLocalDevelopmentCache).toHaveBeenCalledWith();
  });

  it('will request to save image meta data cache on successfully processing images', async () => {
    const mockImageMetaDatas = [{} as any, {} as any];
    mockGetImageMetaData.mockResolvedValueOnce({
      imageFilesMetaData: mockImageMetaDatas,
      invalidCachedImages: [],
      totalImagesCached: mockTotalImagesCached,
      totalImagesFound: mockTotalImagesFound,
    });
    await processStaticImages();
    expect(mockSaveImageMetaDataCache).toHaveBeenCalledWith();
  });

  it('will request to save config to cache on successfully processing images', async () => {
    const mockImageMetaDatas = [{} as any, {} as any];
    mockGetImageMetaData.mockResolvedValueOnce({
      imageFilesMetaData: mockImageMetaDatas,
      invalidCachedImages: [],
      totalImagesCached: mockTotalImagesCached,
      totalImagesFound: mockTotalImagesFound,
    });
    await processStaticImages();
    expect(mockSaveConfigToCache).toHaveBeenCalledWith();
  });

  it('will log out if get image meta data finds images in cache that are no longer used', async () => {
    const testInvalidCachedImages = [{} as any, {} as any];
    mockGetImageMetaData.mockResolvedValue({
      imageFilesMetaData: [],
      invalidCachedImages: testInvalidCachedImages,
      totalImagesCached: mockTotalImagesCached,
      totalImagesFound: mockTotalImagesFound,
    });
    await processStaticImages();

    expect(mockInfoLogger).toHaveBeenCalledWith(
      `Found ${testInvalidCachedImages.length} images in cache no longer used. Deleting from cache`,
    );
  });

  it('will request to remove invalid images that are no longer used', async () => {
    const testInvalidCachedImages = [{ foo: 'bar' } as any, {} as any];
    mockGetImageMetaData.mockResolvedValue({
      imageFilesMetaData: [],
      invalidCachedImages: testInvalidCachedImages,
      totalImagesCached: mockTotalImagesCached,
      totalImagesFound: mockTotalImagesFound,
    });
    await processStaticImages();

    expect(mockRemoveInvalidImages).toHaveBeenCalledWith(
      testInvalidCachedImages,
    );
  });
});
