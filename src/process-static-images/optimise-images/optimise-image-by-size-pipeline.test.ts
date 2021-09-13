import { optimiseImageBySizePipeline } from './optimise-image-by-size-pipeline';

const mockPipelineToFile = jest.fn();
const mockPipelinePng = jest.fn().mockImplementation(() => ({
  toFile: mockPipelineToFile,
}));
const mockPipelineResize = jest.fn().mockImplementation(() => ({
  png: mockPipelinePng,
}));
const mockPipeline = {
  resize: mockPipelineResize,
};
const testImageSize = 400;
const testOptimisedImageCompressionLevel = 5;
const testOptimisedImageColourQuality = 80;
const testImageSizeFilePath = 'baz/foo/bar';

describe('optimiseImageBySizePipeline', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('will request to resize image to thumbnail width', () => {
    optimiseImageBySizePipeline({
      imageSizeFilePath: testImageSizeFilePath,
      optimisedImageColourQuality: testOptimisedImageColourQuality,
      optimisedImageCompressionLevel: testOptimisedImageCompressionLevel,
      optimisedImageSize: testImageSize,
      pipeline: mockPipeline as any,
    });

    expect(mockPipelineResize).toBeCalledWith({ width: testImageSize });
  });

  it('will request to convert image to png with quality and high compression levels set by arguments', () => {
    optimiseImageBySizePipeline({
      imageSizeFilePath: testImageSizeFilePath,
      optimisedImageColourQuality: testOptimisedImageColourQuality,
      optimisedImageCompressionLevel: testOptimisedImageCompressionLevel,
      optimisedImageSize: testImageSize,
      pipeline: mockPipeline as any,
    });

    expect(mockPipelinePng).toBeCalledWith({
      compressionLevel: testOptimisedImageCompressionLevel,
      quality: testOptimisedImageColourQuality,
    });
  });

  it('will attempt to write to file the return from the pipeline', async () => {
    await optimiseImageBySizePipeline({
      imageSizeFilePath: testImageSizeFilePath,
      optimisedImageColourQuality: testOptimisedImageColourQuality,
      optimisedImageCompressionLevel: testOptimisedImageCompressionLevel,
      optimisedImageSize: testImageSize,
      pipeline: mockPipeline as any,
    });

    expect(mockPipelineToFile).toBeCalledWith(testImageSizeFilePath);
  });

  it('will rethrow any error with human readable prefix', async () => {
    const testErrorMessage = 'oppsies daisies';
    mockPipelineResize.mockImplementationOnce(() => {
      throw new Error(testErrorMessage);
    });

    await expect(() =>
      optimiseImageBySizePipeline({
        imageSizeFilePath: testImageSizeFilePath,
        optimisedImageColourQuality: testOptimisedImageColourQuality,
        optimisedImageCompressionLevel: testOptimisedImageCompressionLevel,
        optimisedImageSize: testImageSize,
        pipeline: mockPipeline as any,
      }),
    ).rejects.toThrowError(
      `Error processing image size '${testImageSize}' pipeline: ${testErrorMessage}`,
    );
  });
});
