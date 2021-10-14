const mockPipelineToFile = jest.fn();
const mockPipelinePng = jest.fn().mockImplementation(() => ({
  toFile: mockPipelineToFile,
}));
const mockPipeline = {
  png: mockPipelinePng,
};
const mockCopyFile = jest.fn();
const testOptimisedImageCompressionLevel = 5;
const testOptimisedImageColourQuality = 80;
const testImagePublicFilePath = 'qwerty';
const testImageCurrentFilePath = 'jennifer';
const mockThrownExceptionToError = jest.fn();

jest.mock('fs', () => ({
  promises: {
    copyFile: mockCopyFile,
  },
}));

jest.mock('../../utils/thrown-exception', () => ({
  thrownExceptionToError: mockThrownExceptionToError,
}));

import { originalImagePipeline } from './original-image-pipeline';

describe('originalImagePipeline', () => {
  afterEach(jest.clearAllMocks);

  it('will request to copy original image if compress original image setting is false', () => {
    originalImagePipeline({
      compressOriginalImage: false,
      imageCurrentFilePath: testImageCurrentFilePath,
      imagePublicFilePath: testImagePublicFilePath,
      optimisedImageColourQuality: testOptimisedImageColourQuality,
      optimisedImageCompressionLevel: testOptimisedImageCompressionLevel,
      pipeline: mockPipeline as any,
    });

    expect(mockCopyFile).toBeCalledWith(
      testImageCurrentFilePath,
      testImagePublicFilePath,
    );
    expect(mockPipelinePng).not.toBeCalled();
  });

  it('will request to convert image to png with quality and high compression levels set by arguments if compress original setting is true', () => {
    originalImagePipeline({
      compressOriginalImage: true,
      imageCurrentFilePath: testImageCurrentFilePath,
      imagePublicFilePath: testImagePublicFilePath,
      optimisedImageColourQuality: testOptimisedImageColourQuality,
      optimisedImageCompressionLevel: testOptimisedImageCompressionLevel,
      pipeline: mockPipeline as any,
    });

    expect(mockCopyFile).not.toBeCalled();
    expect(mockPipelinePng).toBeCalledWith({
      compressionLevel: testOptimisedImageCompressionLevel,
      quality: testOptimisedImageColourQuality,
    });
  });

  it('will attempt to write to file the return from the pipeline if compress original setting is true', async () => {
    await originalImagePipeline({
      compressOriginalImage: true,
      imageCurrentFilePath: testImageCurrentFilePath,
      imagePublicFilePath: testImagePublicFilePath,
      optimisedImageColourQuality: testOptimisedImageColourQuality,
      optimisedImageCompressionLevel: testOptimisedImageCompressionLevel,
      pipeline: mockPipeline as any,
    });

    expect(mockPipelineToFile).toBeCalledWith(testImagePublicFilePath);
  });

  it('will request to rethrow any error with human readable prefix stating it attempted to convert image if compress original setting is true', async () => {
    const testErrorMessage = 'oppsies daisies';
    mockPipelinePng.mockImplementationOnce(() => {
      throw new Error(testErrorMessage);
    });

    await originalImagePipeline({
      compressOriginalImage: true,
      imageCurrentFilePath: testImageCurrentFilePath,
      imagePublicFilePath: testImagePublicFilePath,
      optimisedImageColourQuality: testOptimisedImageColourQuality,
      optimisedImageCompressionLevel: testOptimisedImageCompressionLevel,
      pipeline: mockPipeline as any,
    }),
      expect(mockThrownExceptionToError).toBeCalledWith(
        new Error(testErrorMessage),
        `Error processing original image pipeline. Unable to convert and save image`,
      );
  });

  it('will request to rethrow any error with human readable prefix stating it attempted to move image if compress original setting is false', async () => {
    const testErrorMessage = 'oppsies daisies';
    mockCopyFile.mockImplementationOnce(() => {
      throw new Error(testErrorMessage);
    });

    await originalImagePipeline({
      compressOriginalImage: false,
      imageCurrentFilePath: testImageCurrentFilePath,
      imagePublicFilePath: testImagePublicFilePath,
      optimisedImageColourQuality: testOptimisedImageColourQuality,
      optimisedImageCompressionLevel: testOptimisedImageCompressionLevel,
      pipeline: mockPipeline as any,
    }),
      expect(mockThrownExceptionToError).toBeCalledWith(
        new Error(testErrorMessage),
        `Error processing original image pipeline. Unable to copy image`,
      );
  });
});
