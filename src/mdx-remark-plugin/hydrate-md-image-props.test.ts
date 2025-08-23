import { dirname } from 'path';

import { logger } from '../logger';
import { thrownExceptionToLoggerAsError } from '../utils/thrown-exception';

import { getImageMetaDataByPath } from './get-image-meta-data-by-path';
import { hydrateMdImageProps } from './hydrate-md-image-props';
import type { JsxNode } from './types';

jest.mock('path', () => {
  const mockFileDirectory = 'foo/bar';
  const mockPathDirname = jest.fn().mockReturnValue(mockFileDirectory);

  return {
    dirname: mockPathDirname,
  };
});

jest.mock('../constants', () => {
  const mockOptimisedPublicDirectory = 'publico';
  const mockOriginalImageDirectory = 'tanker';

  return {
    optimisedImagesPublicDirectoryRoot: mockOptimisedPublicDirectory,
    originalImageDirectory: mockOriginalImageDirectory,
  };
});

jest.mock('../logger', () => {
  const mockErrorLogger = jest.fn();

  return {
    logger: {
      error: mockErrorLogger,
    },
  };
});

jest.mock('../utils/thrown-exception', () => {
  const mockThrownExceptionToLoggerAsError = jest.fn();

  return {
    thrownExceptionToLoggerAsError: mockThrownExceptionToLoggerAsError,
  };
});

jest.mock('./get-image-meta-data-by-path', () => {
  const mockGetImageMetaDataByPath = jest.fn().mockReturnValue({});

  return {
    getImageMetaDataByPath: mockGetImageMetaDataByPath,
  };
});

jest.mock('../static-image-config', () => {
  return {
    getStaticImageConfig: jest
      .fn()
      .mockImplementation(() => ({ compressOriginalImage: true })),
    imageFormat: {
      png: 'png',
    },
  };
});

// Get references to the mocked functions
const mockPathDirname = dirname as jest.MockedFunction<typeof dirname>;
const mockGetImageMetaDataByPath =
  getImageMetaDataByPath as jest.MockedFunction<typeof getImageMetaDataByPath>;
const mockErrorLogger = logger.error as jest.MockedFunction<
  typeof logger.error
>;
const mockThrownExceptionToLoggerAsError =
  thrownExceptionToLoggerAsError as jest.MockedFunction<
    typeof thrownExceptionToLoggerAsError
  >;

// Test constants
const mockFileDirectory = 'foo/bar';
const mockOptimisedPublicDirectory = 'publico';
const mockOriginalImageDirectory = 'tanker';

describe('hydrateMdImageProps', () => {
  it('will request the directory name of the filepath', () => {
    const testFilePath = 'foo/';
    hydrateMdImageProps(testFilePath)({ type: 'image', url: 'bar' });
    expect(mockPathDirname).toHaveBeenCalledTimes(1);
    expect(mockPathDirname).toHaveBeenCalledWith(testFilePath);
  });

  it('will request to get the image meta data', () => {
    const imageSourceValue = 'beetroot';
    hydrateMdImageProps('foo/')({ type: 'image', url: imageSourceValue });
    expect(mockGetImageMetaDataByPath).toHaveBeenCalledWith(
      imageSourceValue,
      mockFileDirectory,
    );
  });

  it('will exit early if no image metadata found and log error', () => {
    const testFilePath = 'qwerty';
    const imageSourceValue = 'beetroot';

    mockGetImageMetaDataByPath.mockReturnValueOnce(undefined);
    const testNode = { type: 'image', url: imageSourceValue } as const;
    hydrateMdImageProps(testFilePath)(testNode);
    expect(testNode).toStrictEqual({ type: 'image', url: imageSourceValue });
    expect(mockErrorLogger).toHaveBeenCalledWith(
      `Cannot find processed image, within a markdown image tag, with path "${imageSourceValue}" from "${testFilePath}"`,
    );
    expect(mockThrownExceptionToLoggerAsError).not.toHaveBeenCalled();
  });

  it('will transform the node to type JSX and include the hydrated props for the image', () => {
    const testHash = 'django';
    const testUniqueName = 'derek';
    const testImageBase64 = 'beebop';
    const testHeight = 10;
    const testWidth = 30;
    mockGetImageMetaDataByPath.mockReturnValueOnce({
      height: testHeight,
      imageHash: testHash,
      placeholderBase64: testImageBase64,
      uniqueName: testUniqueName,
      width: testWidth,
    });
    const testNode = { type: 'image', url: 'bar' } as const;
    hydrateMdImageProps('jumbo/round')(testNode);
    expect((testNode as unknown as JsxNode).value).toBe(
      `<img src="/${mockOptimisedPublicDirectory}/${mockOriginalImageDirectory}/${testHash}${testUniqueName}.png" placeholderbase64="${testImageBase64}" width={${testWidth}} height={${testHeight}} />`,
    );
    expect((testNode as unknown as JsxNode).type).toBe('jsx');
    expect(mockErrorLogger).not.toHaveBeenCalled();
    expect(mockThrownExceptionToLoggerAsError).not.toHaveBeenCalled();
  });

  it('will transform the node to type JSX with image type being per the original if not set to be compressed', async () => {
    jest.resetModules();
    const testHash = 'django';
    const testUniqueName = 'derek';
    const testImageBase64 = 'beebop';
    const testHeight = 10;
    const testWidth = 30;
    const testImageType = 'webp';
    const testOptimisedPublicDirectory = 'publico';
    const testOriginalImageDirectory = 'tanker';

    jest.mock('../static-image-config', () => ({
      getStaticImageConfig: jest
        .fn()
        .mockImplementation(() => ({ compressOriginalImage: false })),
      imageFormat: {
        png: 'png',
      },
    }));

    jest.mock('./get-image-meta-data-by-path', () => ({
      getImageMetaDataByPath: jest.fn().mockReturnValue({
        height: testHeight,
        imageHash: testHash,
        originalFileType: testImageType,
        placeholderBase64: testImageBase64,
        uniqueName: testUniqueName,
        width: testWidth,
      }),
    }));

    const testNode = { type: 'image', url: 'bar' } as const;
    const { hydrateMdImageProps } = await import('./hydrate-md-image-props');
    hydrateMdImageProps('jumbo/round')(testNode);
    expect((testNode as unknown as JsxNode).value).toBe(
      `<img src="/${testOptimisedPublicDirectory}/${testOriginalImageDirectory}/${testHash}${testUniqueName}.${testImageType}" placeholderbase64="${testImageBase64}" width={${testWidth}} height={${testHeight}} />`,
    );
    expect((testNode as unknown as JsxNode).type).toBe('jsx');
    expect(mockErrorLogger).not.toHaveBeenCalled();
    expect(mockThrownExceptionToLoggerAsError).not.toHaveBeenCalled();
  });

  it('will add in title and alt tag from original node if present', () => {
    const testHash = 'django';
    const testUniqueName = 'derek';
    const testImageBase64 = 'beebop';
    const testHeight = 10;
    const testWidth = 30;
    mockGetImageMetaDataByPath.mockReturnValueOnce({
      height: testHeight,
      imageHash: testHash,
      placeholderBase64: testImageBase64,
      uniqueName: testUniqueName,
      width: testWidth,
    });
    const testTitle = 'moby';
    const testAltTitle = 'dick';
    const testNode = {
      alt: testAltTitle,
      title: testTitle,
      type: 'image',
      url: 'bar',
    } as const;
    hydrateMdImageProps('jumbo/round')(testNode);
    expect((testNode as unknown as JsxNode).value).toBe(
      `<img alt="${testAltTitle}" title="${testTitle}" src="/${mockOptimisedPublicDirectory}/${mockOriginalImageDirectory}/${testHash}${testUniqueName}.png" placeholderbase64="${testImageBase64}" width={${testWidth}} height={${testHeight}} />`,
    );
  });
});
