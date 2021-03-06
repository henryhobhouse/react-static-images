const mockLastUpdatedTimeInMs = 12_345;
const mockFsStat = jest.fn().mockImplementation(() =>
  Promise.resolve({
    mtimeMs: mockLastUpdatedTimeInMs,
  }),
);
const mockStaticImageConfig = {
  moveOriginalImageToPublic: false,
  optimisedImageColourQuality: 99,
  optimisedImageCompressionLevel: 101,
  optimisedImageSizes: [12, 34],
  thumbnailSize: 4,
};
const mockGetStaticImageConfig = jest
  .fn()
  .mockImplementation(() => mockStaticImageConfig);
const mockRootPublicImageDirectory = 'foo/bar';
const mockOriginalImageDirectoryPath = 'john';
const mockThumbnailDirectoryPath = '/baz';
const mockAddCacheAttribute = jest.fn();
const mockSaveCacheToFileSystem = jest.fn();
const mockAddLocalCacheAttribute = jest.fn();
const mockSaveLocalCacheToFileSystem = jest.fn();
const mockOptimiseImageBySizePipeline = jest.fn();
const mockThumbnailPipeline = jest.fn();
const mockProgressBarIncrement = jest.fn();
const mockGetInstanceOfProgressBar = jest.fn().mockReturnValue({
  increment: mockProgressBarIncrement,
});
const mockOriginalImagePipeline = jest.fn();
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

jest.mock('../../cli-progress-bar', () => ({
  cliProgressBar: {
    getInstance: mockGetInstanceOfProgressBar,
  },
}));

jest.mock('fs', () => {
  const orgLibrary = jest.requireActual('fs');

  return {
    ...orgLibrary,
    promises: {
      stat: mockFsStat,
    },
  };
});

jest.mock('../../static-image-config', () => ({
  getStaticImageConfig: mockGetStaticImageConfig,
  imageFormat: {
    png: 'png',
  },
}));

jest.mock('../../constants', () => ({
  originalImageDirectoryPath: mockOriginalImageDirectoryPath,
  rootPublicImageDirectory: mockRootPublicImageDirectory,
  thumbnailDirectoryPath: mockThumbnailDirectoryPath,
}));

jest.mock('../../caching', () => ({
  localDeveloperImageCache: {
    addCacheAttribute: mockAddLocalCacheAttribute,
    saveCacheToFileSystem: mockSaveLocalCacheToFileSystem,
  },
  processedImageMetaDataCache: {
    addCacheAttribute: mockAddCacheAttribute,
    saveCacheToFileSystem: mockSaveCacheToFileSystem,
  },
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
jest.mock('../../utils/data-fingerprinting', () => ({
  getFileContentShortHashByPath: mockGetFileContentShortHashByPath,
}));
jest.mock('./original-image-pipeline', () => ({
  originalImagePipeline: mockOriginalImagePipeline,
}));

import { existsSync, unlinkSync } from 'fs';
import path from 'path';

import VError from 'verror';

import {
  defaultErrorLogFileName,
  imageFormat,
} from '../../static-image-config/config-constants';
import { thumbnailFileExtension } from '../process-static-image-constants';

import { optimiseImages } from './optimise-images';

describe('optimiseImages', () => {
  afterEach(() => {
    jest.clearAllMocks();
    const errorLogFilePath = path.join(process.cwd(), defaultErrorLogFileName);
    if (existsSync(errorLogFilePath)) unlinkSync(errorLogFilePath);
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
      thumbnailFilePath: path.join(
        mockThumbnailDirectoryPath,
        `${testUniqueName}.${thumbnailFileExtension}`,
      ),
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
      imageSizeFilePath: path.join(
        mockRootPublicImageDirectory,
        imageSize.toString(),
        `${mockHash}${testUniqueName}.${imageFormat.png}`,
      ),
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

  it('will request original image pipeline if set to move original image in global config', async () => {
    const testPath = 'baz/top';
    const testCompressImage = true;
    const testUniqueName = 'qwerty';
    const testOptimisedImageColourQuality = 990;
    const testOptimisedImageCompressionLevel = 87;
    await optimiseImages({
      imagesFileSystemMetaData: [
        {
          fileName: 'trigger',
          path: testPath,
          type: 'png',
          uniqueImageName: testUniqueName,
        },
      ],
    });

    expect(mockOriginalImagePipeline).not.toBeCalled();

    mockGetStaticImageConfig.mockImplementationOnce(() => ({
      compressOriginalImage: testCompressImage,
      moveOriginalImageToPublic: true,
      optimisedImageColourQuality: testOptimisedImageColourQuality,
      optimisedImageCompressionLevel: testOptimisedImageCompressionLevel,
      optimisedImageSizes: [12, 34],
      thumbnailSize: 4,
    }));

    await optimiseImages({
      imagesFileSystemMetaData: [
        {
          fileName: 'trigger',
          path: testPath,
          type: 'png',
          uniqueImageName: testUniqueName,
        },
      ],
    });

    expect(mockOriginalImagePipeline).toBeCalledWith({
      compressOriginalImage: testCompressImage,
      imageCurrentFilePath: testPath,
      imagePublicFilePath: `${mockOriginalImageDirectoryPath}/${mockHash}${testUniqueName}.png`,
      optimisedImageColourQuality: testOptimisedImageColourQuality,
      optimisedImageCompressionLevel: testOptimisedImageCompressionLevel,
      pipeline: mockPipelineCloneReturnValue,
    });
  });

  it('will request original image pipeline with optimised path to keep original file type if set not to compress original', async () => {
    const testPath = 'baz/top';
    const testCompressImage = false;
    const testUniqueName = 'pingu';
    const testOptimisedImageColourQuality = 990;
    const testOptimisedImageCompressionLevel = 87;
    const testOriginalFileType = 'tiff';

    mockGetStaticImageConfig.mockImplementationOnce(() => ({
      compressOriginalImage: testCompressImage,
      moveOriginalImageToPublic: true,
      optimisedImageColourQuality: testOptimisedImageColourQuality,
      optimisedImageCompressionLevel: testOptimisedImageCompressionLevel,
      optimisedImageSizes: [12, 34],
      thumbnailSize: 4,
    }));

    await optimiseImages({
      imagesFileSystemMetaData: [
        {
          fileName: 'trigger',
          path: testPath,
          type: testOriginalFileType,
          uniqueImageName: testUniqueName,
        },
      ],
    });

    expect(mockOriginalImagePipeline).toBeCalledWith({
      compressOriginalImage: testCompressImage,
      imageCurrentFilePath: testPath,
      imagePublicFilePath: `${mockOriginalImageDirectoryPath}/${mockHash}${testUniqueName}.${testOriginalFileType}`,
      optimisedImageColourQuality: testOptimisedImageColourQuality,
      optimisedImageCompressionLevel: testOptimisedImageCompressionLevel,
      pipeline: mockPipelineCloneReturnValue,
    });
  });

  it('will request to add image meta data to cache on successful processing of image', async () => {
    const imageUniqueName = 'django';
    const testFileType = 'tiff';
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
          type: testFileType,
          uniqueImageName: imageUniqueName,
        },
      ],
    });

    expect(mockAddCacheAttribute).toBeCalledWith({
      imageAttributes: {
        height: undefined,
        imageHash: mockHash,
        originalFileType: testFileType,
        width: mockOriginalImageWidth,
      },
      imageCacheKey: imageUniqueName,
    });
  });

  it('will request to add image local developer cache on successful processing of image', async () => {
    const imageUniqueName = 'django';
    const testFilePath = 'baz/top';
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
          path: testFilePath,
          type: 'png',
          uniqueImageName: imageUniqueName,
        },
      ],
    });

    expect(mockAddLocalCacheAttribute).toBeCalledWith({
      imageCacheKey: imageUniqueName,
      lastTimeFileUpdatedInMs: mockLastUpdatedTimeInMs,
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
