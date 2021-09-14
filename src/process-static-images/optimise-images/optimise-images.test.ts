import { existsSync, unlinkSync } from 'fs';
import path from 'path';

import VError from 'verror';

import { defaultErrorLogFileName } from '../../static-image-config/constants';

const mockUpsertProcessedImageMetaData = jest.fn();
const mockOptimiseImageBySizePipeline = jest.fn();
const mockThumbnailPipeline = jest.fn();
const mockValidateOptimisedImageDirectories = jest.fn();
const mockProgressBarIncrement = jest.fn();
const mockGetInstanceOfProgressBar = jest.fn().mockReturnValue({
  increment: mockProgressBarIncrement,
});
const mockStaticImageConfig = {
  optimisedImageColourQuality: 99,
  optimisedImageCompressionLevel: 101,
  optimisedImageSizes: [12, 34],
  thumbnailSize: 4,
};
const mockGetStaticImageConfig = jest
  .fn()
  .mockImplementation(() => mockStaticImageConfig);
const mockRootPublicImageDirectory = 'foo/bar';
const mockThumbnailDirectoryPath = '/baz';
const mockPipelineCloneReturnValue = 'I am a clone';
const mockSharpPipelineClone = jest
  .fn()
  .mockReturnValue(mockPipelineCloneReturnValue);
const mockOriginalImageWidth = 300;
const mockSharpPipelineMetaData = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ width: mockOriginalImageWidth }));
const mockThrownExceptionToLoggerAsError = jest.fn();
const mockSharpPipeline = jest.fn().mockImplementation(() => ({
  clone: mockSharpPipelineClone,
  metadata: mockSharpPipelineMetaData,
}));
const mockHash = 'qwerty';
const mockGetFileContentShortHashByPath = jest
  .fn()
  .mockImplementation(() => Promise.resolve(mockHash));

import { optimiseImages } from './optimise-images';

jest.mock('../../utils/validate-optimised-image-directories', () => ({
  validateOptimisedImageDirectories: mockValidateOptimisedImageDirectories,
}));

jest.mock('../../cli-progress', () => ({
  cliProgressBar: {
    getInstance: mockGetInstanceOfProgressBar,
  },
}));

jest.mock('../../static-image-config', () => ({
  getStaticImageConfig: mockGetStaticImageConfig,
}));

jest.mock('../constants', () => ({
  rootPublicImageDirectory: mockRootPublicImageDirectory,
  thumbnailDirectoryPath: mockThumbnailDirectoryPath,
}));

jest.mock('../../caching', () => ({
  upsertProcessedImageMetaData: mockUpsertProcessedImageMetaData,
}));

jest.mock('sharp', () => ({
  __esModule: true,
  default: mockSharpPipeline,
}));
jest.mock('./optimise-image-by-size-pipeline', () => ({
  optimiseImageBySizePipeline: mockOptimiseImageBySizePipeline,
}));
jest.mock('./thumbnail-pipeline', () => ({
  thumbnailPipeline: mockThumbnailPipeline,
}));
jest.mock('../../utils/thrown-exception', () => ({
  thrownExceptionToLoggerAsError: mockThrownExceptionToLoggerAsError,
}));
jest.mock('../image-files-meta-data');
jest.mock('../../utils/image-fingerprinting', () => ({
  getFileContentShortHashByPath: mockGetFileContentShortHashByPath,
}));

describe('optimiseImages', () => {
  afterEach(() => {
    jest.clearAllMocks();
    const errorLogFilePath = path.join(process.cwd(), defaultErrorLogFileName);
    if (existsSync(errorLogFilePath)) unlinkSync(errorLogFilePath);
  });

  it('will request to validate optimised image directories', () => {
    optimiseImages({ imagesFileSystemMetaData: [] });

    expect(mockValidateOptimisedImageDirectories).toBeCalledWith({
      optimisedImageSizes: mockStaticImageConfig.optimisedImageSizes,
      rootPublicImageDirectory: mockRootPublicImageDirectory,
      thumbnailDirectoryPath: mockThumbnailDirectoryPath,
    });
  });

  it('will get the progress bar instance', () => {
    optimiseImages({ imagesFileSystemMetaData: [] });

    expect(mockGetInstanceOfProgressBar).toBeCalledWith();
  });

  it('will instantiate sharp with the image path', () => {
    const imagePath = 'baz/top';
    optimiseImages({
      imagesFileSystemMetaData: [
        {
          fileName: 'trigger',
          path: imagePath,
          type: 'png',
          uniqueImageName: '',
        },
      ],
    });

    expect(mockSharpPipeline).toBeCalledWith(imagePath);
  });

  it('will request image metadata from sharp pipeline instance', () => {
    optimiseImages({
      imagesFileSystemMetaData: [
        {
          fileName: 'trigger',
          path: 'baz/top',
          type: 'png',
          uniqueImageName: '',
        },
      ],
    });

    expect(mockSharpPipelineMetaData).toBeCalledWith();
  });

  it('will throw an error if metadata does return a width from sharp pipeline metadata instance', async () => {
    mockSharpPipelineMetaData.mockImplementationOnce(() => Promise.resolve({}));
    const testImageType = 'jpeg';
    const testImagePath = 'good/ness/me';

    await optimiseImages({
      imagesFileSystemMetaData: [
        {
          fileName: 'trigger',
          path: testImagePath,
          type: testImageType,
          uniqueImageName: '',
        },
      ],
    });

    expect(mockThrownExceptionToLoggerAsError).toBeCalledWith(
      new VError('Unable to determine image width'),
      `Image of type "${testImageType}" at path "${testImagePath}" cannot be resized`,
    );
  });

  it('will request to get a hash of the file contents', async () => {
    const testImagePath = 'burt/reynolds';
    await optimiseImages({
      imagesFileSystemMetaData: [
        {
          fileName: 'trigger',
          path: testImagePath,
          type: 'png',
          uniqueImageName: '',
        },
      ],
    });

    expect(mockGetFileContentShortHashByPath).toBeCalledWith(testImagePath);
  });

  it('will request to process the image in the thumbnail pipeline with a cloned pipeline', async () => {
    const testUniqueName = 'unique-trigger';
    await optimiseImages({
      imagesFileSystemMetaData: [
        {
          fileName: 'trigger',
          path: 'burt/reynolds',
          type: 'png',
          uniqueImageName: testUniqueName,
        },
      ],
    });

    expect(mockThumbnailPipeline).toBeCalledWith({
      pipeline: mockPipelineCloneReturnValue,
      thumbnailFilePath: `${mockThumbnailDirectoryPath}/${testUniqueName}.base64`,
      thumbnailSize: mockStaticImageConfig.thumbnailSize,
    });
  });

  it('will not request the image size pipeline when no image sizes specified', async () => {
    mockGetStaticImageConfig.mockImplementationOnce(() => ({
      optimisedImageColourQuality: 99,
      optimisedImageCompressionLevel: 101,
      optimisedImageSizes: [],
      thumbnailSize: 4,
    }));
    const testUniqueName = 'unique-trigger';
    await optimiseImages({
      imagesFileSystemMetaData: [
        {
          fileName: 'trigger',
          path: 'burt/reynolds',
          type: 'png',
          uniqueImageName: testUniqueName,
        },
      ],
    });

    expect(mockThumbnailPipeline).toBeCalledTimes(1);
    expect(mockOptimiseImageBySizePipeline).toBeCalledTimes(0);
  });

  it('will request the image size pipeline with cloned pipeline, image meta data and public file path', async () => {
    const imageSize = 100;
    const compressionLevel = 1010;
    const colourQuality = 990;
    const fileType = 'webp';
    mockGetStaticImageConfig.mockImplementationOnce(() => ({
      optimisedImageColourQuality: colourQuality,
      optimisedImageCompressionLevel: compressionLevel,
      optimisedImageSizes: [imageSize],
      thumbnailSize: 4,
    }));
    const testUniqueName = 'unique-trigger';
    await optimiseImages({
      imagesFileSystemMetaData: [
        {
          fileName: 'trigger',
          path: 'burt/reynolds',
          type: fileType,
          uniqueImageName: testUniqueName,
        },
      ],
    });

    expect(mockOptimiseImageBySizePipeline).toBeCalledWith({
      imageSizeFilePath: `${mockRootPublicImageDirectory}/${imageSize}/${mockHash}${testUniqueName}.${fileType}`,
      optimisedImageColourQuality: colourQuality,
      optimisedImageCompressionLevel: compressionLevel,
      optimisedImageSize: imageSize,
      pipeline: mockPipelineCloneReturnValue,
    });
  });

  it('will only request image size pipeline with image sizes smaller than the original', async () => {
    const imageSizeSmallerThanOriginal = mockOriginalImageWidth - 100;
    mockGetStaticImageConfig.mockImplementationOnce(() => ({
      optimisedImageColourQuality: 89,
      optimisedImageCompressionLevel: 34,
      optimisedImageSizes: [
        imageSizeSmallerThanOriginal,
        mockOriginalImageWidth,
        mockOriginalImageWidth + 20,
      ],
      thumbnailSize: 4,
    }));
    await optimiseImages({
      imagesFileSystemMetaData: [
        {
          fileName: 'trigger',
          path: 'burt/reynolds',
          type: 'png',
          uniqueImageName: 'unique-trigger',
        },
      ],
    });

    expect(mockThumbnailPipeline).toBeCalledTimes(1);
    expect(mockOptimiseImageBySizePipeline).toBeCalledWith(
      expect.objectContaining({
        optimisedImageSize: imageSizeSmallerThanOriginal,
      }),
    );
  });

  it('will request to upsert image meta data on successful processing of image', async () => {
    const imageUniqueName = 'django';
    mockGetStaticImageConfig.mockImplementationOnce(() => ({
      optimisedImageColourQuality: 4,
      optimisedImageCompressionLevel: 5,
      optimisedImageSizes: [mockOriginalImageWidth - 100],
      thumbnailSize: 4,
    }));

    await optimiseImages({
      imagesFileSystemMetaData: [
        {
          fileName: 'trigger',
          path: 'baz/top',
          type: 'png',
          uniqueImageName: imageUniqueName,
        },
      ],
    });

    expect(mockUpsertProcessedImageMetaData).toBeCalledWith({
      imageAttributes: {
        height: undefined,
        imageHash: mockHash,
        width: mockOriginalImageWidth,
      },
      imageCacheKey: imageUniqueName,
    });
  });

  it('will request to increment the progress bar on completion of image process', async () => {
    mockGetStaticImageConfig.mockImplementationOnce(() => ({
      optimisedImageColourQuality: 4,
      optimisedImageCompressionLevel: 5,
      optimisedImageSizes: [mockOriginalImageWidth - 100],
      thumbnailSize: 4,
    }));

    await optimiseImages({
      imagesFileSystemMetaData: [
        {
          fileName: 'trigger',
          path: 'baz/top',
          type: 'png',
          uniqueImageName: 'django',
        },
      ],
    });

    expect(mockProgressBarIncrement).toBeCalledWith();
  });
});
