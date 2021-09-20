const mockInfoLogger = jest.fn();
const mockLogLogger = jest.fn();
const mockTotalImagesCached = 12;
const mockTotalImagesFound = 45;
const mockGetImageMetaData = jest.fn().mockImplementation(() => ({
  imageFilesMetaData: [],
  totalImagesCached: mockTotalImagesCached,
  totalImagesFound: mockTotalImagesFound,
}));
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

import VError from 'verror';

import type { ImageFileSystemMetaData } from './image-files-meta-data';
import { processStaticImages } from './process-static-images';

jest.mock('../logger', () => ({
  logger: {
    info: mockInfoLogger,
    log: mockLogLogger,
  },
}));

jest.mock('./constants', () => ({
  rootPublicImageDirectory: mockRootPublicImageDirectory,
  thumbnailDirectoryPath: mockThumbnailDirectoryPath,
}));

jest.mock('../static-image-config', () => ({
  getStaticImageConfig: jest.fn().mockReturnValue({
    optimisedImageSizes: mockOptimisedImageSizes,
  }),
}));

jest.mock('../utils/thrown-exception', () => ({
  thrownExceptionToLoggerAsError: mockThrownExceptionToLoggerAsError,
}));

jest.mock('./image-files-meta-data', () => ({
  getImageFilesMetaData: mockGetImageMetaData,
}));

jest.mock('../cli-progress', () => ({
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

describe('processStaticImages', () => {
  afterEach(jest.clearAllMocks);

  it('will request to validate all directories used to store data from processing images', async () => {
    await processStaticImages();
    expect(mockValidateOptimisedImageDirectories).toBeCalledWith({
      optimisedImageSizes: mockOptimisedImageSizes,
      rootPublicImageDirectory: mockRootPublicImageDirectory,
      thumbnailDirectoryPath: mockThumbnailDirectoryPath,
    });
  });

  it('will request to get all images meta data with no arguments', async () => {
    await processStaticImages();
    expect(mockGetImageMetaData).toBeCalledWith();
  });

  it('will log if no images found and exit from the process', async () => {
    mockGetImageMetaData.mockImplementationOnce(() => ({
      imageFilesMetaData: [],
    }));
    await processStaticImages();
    expect(mockInfoLogger.mock.calls.pop()[0]).toBe(
      'No new images to process.',
    );
  });

  it('will log out how many images need processing when images are found', async () => {
    const mockImageMetaDatas = [{}, {}];
    mockGetImageMetaData.mockImplementationOnce(() => ({
      imageFilesMetaData: mockImageMetaDatas,
    }));
    await processStaticImages();
    expect(mockInfoLogger.mock.calls[1][0]).toBe(
      `${mockImageMetaDatas.length} images to process. Processing...`,
    );
  });

  it('will instantiate and start a progress bar', async () => {
    const mockImageMetaDatas = [{}, {}];
    mockGetImageMetaData.mockImplementationOnce(() => ({
      imageFilesMetaData: mockImageMetaDatas,
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
    }));
    await processStaticImages();

    expect(mockProgressBarStop).toBeCalledWith();
  });

  it('will log out a success message', async () => {
    const mockImageMetaDatas = [{}, {}];
    mockGetImageMetaData.mockImplementationOnce(() => ({
      imageFilesMetaData: mockImageMetaDatas,
    }));
    await processStaticImages();

    expect(mockLogLogger).toBeCalledWith(
      'success',
      'thumbnails and image meta saved from permitted image types.',
    );
  });

  it('will request to stop the progress bar after exception is thrown after its been instantiated', async () => {
    mockOptimiseImages.mockImplementationOnce(() => {
      throw new Error('oppsies');
    });
    mockGetImageMetaData.mockImplementationOnce(() => ({
      imageFilesMetaData: [{}, {}],
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
});
