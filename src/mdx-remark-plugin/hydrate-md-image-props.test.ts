const mockFileDirectory = 'foo/bar';
const mockPathDirname = jest.fn().mockReturnValue(mockFileDirectory);
const mockGetImageMetaDataByPath = jest.fn().mockReturnValue({});
const mockErrorLogger = jest.fn();
const mockOptimisedPublicDirectory = 'publico';
const mockOriginalImageDirectory = 'tanker';
const mockThrownExceptionToLoggerAsError = jest.fn();
jest.mock('path', () => ({
  dirname: mockPathDirname,
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

import { hydrateMdImageProps } from './hydrate-md-image-props';
import type { JsxNode } from './types';

describe('hydrateMdImageProps', () => {
  afterEach(jest.clearAllMocks);

  it('will request the directory name of the filepath', () => {
    const testFilePath = 'foo/';
    hydrateMdImageProps(testFilePath)({ type: 'image', url: 'bar' });
    expect(mockPathDirname).toBeCalledTimes(1);
    expect(mockPathDirname).toBeCalledWith(testFilePath);
  });

  it('will request to get the image meta data', () => {
    const imageSourceValue = 'beetroot';
    hydrateMdImageProps('foo/')({ type: 'image', url: imageSourceValue });
    expect(mockGetImageMetaDataByPath).toBeCalledWith(
      imageSourceValue,
      mockFileDirectory,
    );
  });

  it('will exit early if no image metadata found and log error', () => {
    const testFilePath = 'qwerty';
    const imageSourceValue = 'beetroot';
    // eslint-disable-next-line unicorn/no-useless-undefined
    mockGetImageMetaDataByPath.mockReturnValueOnce(undefined);
    const testNode = { type: 'image', url: imageSourceValue } as const;
    hydrateMdImageProps(testFilePath)(testNode);
    expect(testNode).toStrictEqual({ type: 'image', url: imageSourceValue });
    expect(mockErrorLogger).toBeCalledWith(
      `Cannot find processed image, within a markdown image tag, with path "${imageSourceValue}" from "${testFilePath}"`,
    );
    expect(mockThrownExceptionToLoggerAsError).not.toBeCalled();
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
    expect(mockErrorLogger).not.toBeCalled();
    expect(mockThrownExceptionToLoggerAsError).not.toBeCalled();
  });

  it('will transform the node to type JSX with image type being per the original if not set to be compressed', async () => {
    jest.resetModules();
    const testHash = 'django';
    const testUniqueName = 'derek';
    const testImageBase64 = 'beebop';
    const testHeight = 10;
    const testWidth = 30;
    const testImageType = 'webp';
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
    const testNode = { type: 'image', url: 'bar' } as const;
    const { hydrateMdImageProps } = await import('./hydrate-md-image-props');
    hydrateMdImageProps('jumbo/round')(testNode);
    expect((testNode as unknown as JsxNode).value).toBe(
      `<img src="/${mockOptimisedPublicDirectory}/${mockOriginalImageDirectory}/${testHash}${testUniqueName}.${testImageType}" placeholderbase64="${testImageBase64}" width={${testWidth}} height={${testHeight}} />`,
    );
    expect((testNode as unknown as JsxNode).type).toBe('jsx');
    expect(mockErrorLogger).not.toBeCalled();
    expect(mockThrownExceptionToLoggerAsError).not.toBeCalled();
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
