import { dirname } from 'path';

import { jsxToSimpleAst } from '../jsx-parser';
import { logger } from '../logger';
import { thrownExceptionToLoggerAsError } from '../utils/thrown-exception';

import { getImageMetaDataByPath } from './get-image-meta-data-by-path';
import { hydrateJsxImageProps } from './hydrate-jsx-image-props';

jest.mock('path', () => {
  const mockFileDirectory = 'foo/bar';
  const mockPathDirname = jest.fn().mockReturnValue(mockFileDirectory);

  return {
    dirname: mockPathDirname,
  };
});

jest.mock('../jsx-parser', () => {
  const mockJsxToSimpleAst = jest.fn().mockReturnValue({
    isNonEmptyOpeningTag: false,
    props: {
      src: { type: 'Literal', value: 'baz' },
    },
    type: 'img',
  } as any);

  return {
    jsxToSimpleAst: mockJsxToSimpleAst,
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

const mockPathDirname = dirname as jest.MockedFunction<typeof dirname>;
const mockJsxToSimpleAst = jsxToSimpleAst as jest.MockedFunction<
  typeof jsxToSimpleAst
>;
const mockGetImageMetaDataByPath =
  getImageMetaDataByPath as jest.MockedFunction<typeof getImageMetaDataByPath>;
const mockErrorLogger = logger.error as jest.MockedFunction<
  typeof logger.error
>;
const mockThrownExceptionToLoggerAsError =
  thrownExceptionToLoggerAsError as jest.MockedFunction<
    typeof thrownExceptionToLoggerAsError
  >;

const mockFileDirectory = 'foo/bar';
const mockOptimisedPublicDirectory = 'publico';
const mockOriginalImageDirectory = 'tanker';

describe('hydrateJsxImageProps', () => {
  it('will request the directory name of the filepath', () => {
    const testFilePath = 'foo/';
    hydrateJsxImageProps(testFilePath)({ type: 'jsx', value: 'bar' });
    expect(mockPathDirname).toHaveBeenCalledTimes(1);
    expect(mockPathDirname).toHaveBeenCalledWith(testFilePath);
  });

  it('will request to creat a JXS AST from the MDASTs node value', () => {
    const testValue = 'qwerty';
    hydrateJsxImageProps('foo/')({ type: 'jsx', value: testValue });
    expect(mockJsxToSimpleAst).toHaveBeenCalledWith(testValue);
  });

  it('will exit early, and not mutate the node, if jsx is not an image type', () => {
    mockJsxToSimpleAst.mockReturnValueOnce({
      isNonEmptyOpeningTag: false,
      props: {
        src: { type: 'Literal', value: 'test' },
      },
      type: 'notAnImage',
    } as any);
    const testNode = { type: 'jsx', value: 'bar' } as const;
    hydrateJsxImageProps('foo/')(testNode);
    expect(mockGetImageMetaDataByPath).not.toHaveBeenCalled();
    expect(testNode).toStrictEqual({ type: 'jsx', value: 'bar' });
    expect(mockThrownExceptionToLoggerAsError).not.toHaveBeenCalled();
  });

  it('will exit early if jsx has no "src" prop with truthy value', () => {
    mockJsxToSimpleAst.mockReturnValueOnce({
      isNonEmptyOpeningTag: false,
      props: {
        src: { type: 'Literal', value: '' },
      },
      type: 'img',
    } as any);
    const testNode = { type: 'jsx', value: 'bar' } as const;
    hydrateJsxImageProps('foo/')(testNode);
    expect(mockGetImageMetaDataByPath).not.toHaveBeenCalled();
    expect(testNode).toStrictEqual({ type: 'jsx', value: 'bar' });
    expect(mockThrownExceptionToLoggerAsError).not.toHaveBeenCalled();
  });

  it('will request to get the image meta data', () => {
    const imageSourceValue = 'beetroot';
    mockJsxToSimpleAst.mockReturnValueOnce({
      isNonEmptyOpeningTag: false,
      props: {
        src: { type: 'Literal', value: imageSourceValue },
      },
      type: 'img',
    } as any);
    hydrateJsxImageProps('foo/')({ type: 'jsx', value: 'bar' });
    expect(mockGetImageMetaDataByPath).toHaveBeenCalledWith(
      imageSourceValue,
      mockFileDirectory,
    );
  });

  it('will exit early if no image metadata found and log error', () => {
    const testFilePath = 'qwerty';
    const imageSourceValue = 'beetroot';
    mockJsxToSimpleAst.mockReturnValueOnce({
      isNonEmptyOpeningTag: false,
      props: {
        src: { type: 'Literal', value: imageSourceValue },
      },
      type: 'img',
    } as any);

    mockGetImageMetaDataByPath.mockReturnValueOnce(undefined);
    const testNode = { type: 'jsx', value: 'bar' } as const;
    hydrateJsxImageProps(testFilePath)(testNode);
    expect(testNode).toStrictEqual({ type: 'jsx', value: 'bar' });
    expect(mockErrorLogger).toHaveBeenCalledWith(
      `Cannot find processed image, within a JSX tag, in path "${imageSourceValue}" from "${testFilePath}"`,
    );
    expect(mockThrownExceptionToLoggerAsError).not.toHaveBeenCalled();
  });

  it('will update the node to include the hydrated props for the image', () => {
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
    const testNode = { type: 'jsx', value: 'bar' } as const;
    hydrateJsxImageProps('jumbo/round')(testNode);
    expect(testNode.value).toBe(
      `<img src="/${mockOptimisedPublicDirectory}/${mockOriginalImageDirectory}/${testHash}${testUniqueName}.png" height={${testHeight}} placeholderbase64="${testImageBase64}" width={${testWidth}} />`,
    );
    expect(mockErrorLogger).not.toHaveBeenCalled();
    expect(mockThrownExceptionToLoggerAsError).not.toHaveBeenCalled();
  });

  it('will update the node with image type being per the original if not set to be compressed', async () => {
    jest.resetModules();
    const testHash = 'django';
    const testUniqueName = 'derek';
    const testImageBase64 = 'beebop';
    const testHeight = 10;
    const testWidth = 30;
    const testImageType = 'tiff';
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

    const testNode = { type: 'jsx', value: 'bar' } as const;
    const { hydrateJsxImageProps } = await import('./hydrate-jsx-image-props');
    hydrateJsxImageProps('jumbo/round')(testNode);
    expect(testNode.value).toBe(
      `<img src="/${testOptimisedPublicDirectory}/${testOriginalImageDirectory}/${testHash}${testUniqueName}.${testImageType}" height={${testHeight}} placeholderbase64="${testImageBase64}" width={${testWidth}} />`,
    );
    expect(mockErrorLogger).not.toHaveBeenCalled();
    expect(mockThrownExceptionToLoggerAsError).not.toHaveBeenCalled();
  });

  it('will update the node but maintain original, non-conflicting, props from the node', () => {
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
    const testPropertyKey = 'marian';
    const testPropertyValue = 'john';
    const testNode = {
      type: 'jsx',
      value: 'bar',
    } as const;
    mockJsxToSimpleAst.mockReturnValueOnce({
      isNonEmptyOpeningTag: false,
      props: {
        src: { type: 'Literal', value: 'baz' },
        [testPropertyKey]: {
          type: 'Literal',
          value: testPropertyValue,
        },
      },
      type: 'img',
    } as any);
    hydrateJsxImageProps('jumbo/round')(testNode);
    expect(testNode.value).toBe(
      `<img src="/${mockOptimisedPublicDirectory}/${mockOriginalImageDirectory}/${testHash}${testUniqueName}.png" ${testPropertyKey}="${testPropertyValue}" height={${testHeight}} placeholderbase64="${testImageBase64}" width={${testWidth}} />`,
    );
  });

  it('will catch any exception gracefully and log it', () => {
    const testError = 'oppsies';
    mockJsxToSimpleAst.mockImplementationOnce(() => {
      throw new Error(testError);
    });
    const testNode = { type: 'jsx', value: 'bar' } as const;
    const testFilePath = 'jumbo/round';
    hydrateJsxImageProps(testFilePath)(testNode);
    expect(testNode).toStrictEqual({ type: 'jsx', value: 'bar' });
    expect(mockThrownExceptionToLoggerAsError).toHaveBeenCalledWith(
      new Error(testError),
      `Unable to hydrate properties for JSX tag "${testNode.value}" with path from "${testFilePath}"`,
    );
  });
});
