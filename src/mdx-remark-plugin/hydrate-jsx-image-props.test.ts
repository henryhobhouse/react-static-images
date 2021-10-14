const mockFileDirectory = 'foo/bar';
const mockPathDirname = jest.fn().mockReturnValue(mockFileDirectory);
const mockJsxToSimpleAst = jest.fn().mockReturnValue({
  props: {
    src: { value: 'baz' },
  },
  type: 'img',
});
const mockGetImageMetaDataByPath = jest.fn().mockReturnValue({});
const mockErrorLogger = jest.fn();
const mockOptimisedPublicDirectory = 'publico';
const mockOriginalImageDirectory = 'tanker';
const mockThrownExceptionToLoggerAsError = jest.fn();
jest.mock('path', () => ({
  dirname: mockPathDirname,
}));
jest.mock('../jsx-parser', () => ({
  jsxToSimpleAst: mockJsxToSimpleAst,
}));
jest.mock('../constants', () => ({
  optimisedImagesPublicDirectoryRoot: mockOptimisedPublicDirectory,
  originalImageDirectory: mockOriginalImageDirectory,
}));
jest.mock('../logger', () => ({
  logger: {
    error: mockErrorLogger,
  },
}));
jest.mock('../utils/thrown-exception', () => ({
  thrownExceptionToLoggerAsError: mockThrownExceptionToLoggerAsError,
}));
jest.mock('./get-image-meta-data-by-path', () => ({
  getImageMetaDataByPath: mockGetImageMetaDataByPath,
}));
jest.mock('../static-image-config', () => ({
  getStaticImageConfig: jest
    .fn()
    .mockImplementation(() => ({ compressOriginalImage: true })),
  imageFormat: {
    png: 'png',
  },
}));

import { hydrateJsxImageProps } from './hydrate-jsx-image-props';

describe('hydrateJsxImageProps', () => {
  afterEach(jest.clearAllMocks);

  it('will request the directory name of the filepath', () => {
    const testFilePath = 'foo/';
    hydrateJsxImageProps(testFilePath)({ type: 'jsx', value: 'bar' });
    expect(mockPathDirname).toBeCalledTimes(1);
    expect(mockPathDirname).toBeCalledWith(testFilePath);
  });

  it('will request to creat a JXS AST from the MDASTs node value', () => {
    const testValue = 'qwerty';
    hydrateJsxImageProps('foo/')({ type: 'jsx', value: testValue });
    expect(mockJsxToSimpleAst).toBeCalledWith(testValue);
  });

  it('will exit early, and not mutate the node, if jsx is not an image type', () => {
    mockJsxToSimpleAst.mockReturnValueOnce({
      props: {
        src: {},
      },
      type: 'notAnImage',
    });
    const testNode = { type: 'jsx', value: 'bar' } as const;
    hydrateJsxImageProps('foo/')(testNode);
    expect(mockGetImageMetaDataByPath).not.toBeCalled();
    expect(testNode).toStrictEqual({ type: 'jsx', value: 'bar' });
    expect(mockThrownExceptionToLoggerAsError).not.toBeCalled();
  });

  it('will exit early if jsx has no "src" prop with truthy value', () => {
    mockJsxToSimpleAst.mockReturnValueOnce({
      props: {
        src: {},
      },
      type: 'img',
    });
    const testNode = { type: 'jsx', value: 'bar' } as const;
    hydrateJsxImageProps('foo/')(testNode);
    expect(mockGetImageMetaDataByPath).not.toBeCalled();
    expect(testNode).toStrictEqual({ type: 'jsx', value: 'bar' });
    expect(mockThrownExceptionToLoggerAsError).not.toBeCalled();
  });

  it('will request to get the image meta data', () => {
    const imageSourceValue = 'beetroot';
    mockJsxToSimpleAst.mockReturnValueOnce({
      props: {
        src: { value: imageSourceValue },
      },
      type: 'img',
    });
    hydrateJsxImageProps('foo/')({ type: 'jsx', value: 'bar' });
    expect(mockGetImageMetaDataByPath).toBeCalledWith(
      imageSourceValue,
      mockFileDirectory,
    );
  });

  it('will exit early if no image metadata found and log error', () => {
    const testFilePath = 'qwerty';
    const imageSourceValue = 'beetroot';
    mockJsxToSimpleAst.mockReturnValueOnce({
      props: {
        src: { value: imageSourceValue },
      },
      type: 'img',
    });
    // eslint-disable-next-line unicorn/no-useless-undefined
    mockGetImageMetaDataByPath.mockReturnValueOnce(undefined);
    const testNode = { type: 'jsx', value: 'bar' } as const;
    hydrateJsxImageProps(testFilePath)(testNode);
    expect(testNode).toStrictEqual({ type: 'jsx', value: 'bar' });
    expect(mockErrorLogger).toBeCalledWith(
      `Cannot find processed image, within a JSX tag, in path "${imageSourceValue}" from "${testFilePath}"`,
    );
    expect(mockThrownExceptionToLoggerAsError).not.toBeCalled();
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
    expect(mockErrorLogger).not.toBeCalled();
    expect(mockThrownExceptionToLoggerAsError).not.toBeCalled();
  });

  it('will update the node with image type being per the original if not set to be compressed', async () => {
    jest.resetModules();
    const testHash = 'django';
    const testUniqueName = 'derek';
    const testImageBase64 = 'beebop';
    const testHeight = 10;
    const testWidth = 30;
    const testImageType = 'tiff';
    jest.mock('../static-image-config', () => ({
      getStaticImageConfig: jest
        .fn()
        .mockImplementation(() => ({ compressOriginalImage: false })),
      imageFormat: {
        png: 'png',
      },
    }));
    mockGetImageMetaDataByPath.mockReturnValueOnce({
      height: testHeight,
      imageHash: testHash,
      originalFileType: testImageType,
      placeholderBase64: testImageBase64,
      uniqueName: testUniqueName,
      width: testWidth,
    });
    const testNode = { type: 'jsx', value: 'bar' } as const;
    const { hydrateJsxImageProps } = await import('./hydrate-jsx-image-props');
    hydrateJsxImageProps('jumbo/round')(testNode);
    expect(testNode.value).toBe(
      `<img src="/${mockOptimisedPublicDirectory}/${mockOriginalImageDirectory}/${testHash}${testUniqueName}.${testImageType}" height={${testHeight}} placeholderbase64="${testImageBase64}" width={${testWidth}} />`,
    );
    expect(mockErrorLogger).not.toBeCalled();
    expect(mockThrownExceptionToLoggerAsError).not.toBeCalled();
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
      props: {
        src: { value: 'baz' },
        [testPropertyKey]: {
          type: 'Literal',
          value: testPropertyValue,
        },
      },
      type: 'img',
    });
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
    expect(mockThrownExceptionToLoggerAsError).toBeCalledWith(
      new Error(testError),
      `Unable to hydrate properties for JSX tag "${testNode.value}" with path from "${testFilePath}"`,
    );
  });
});
