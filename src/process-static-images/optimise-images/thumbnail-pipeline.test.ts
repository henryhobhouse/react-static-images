const mockFsPromisesWriteFile = jest.fn();
const mockThrownExceptionToError = jest.fn();

import { thumbnailPipeline } from './thumbnail-pipeline';

const mockPipelineToBuffer = jest
  .fn()
  .mockImplementation(() => Buffer.from('fooBar'));
const mockPipelinePng = jest.fn().mockImplementation(() => ({
  toBuffer: mockPipelineToBuffer,
}));
const mockPipelineResize = jest.fn().mockImplementation(() => ({
  png: mockPipelinePng,
}));
const mockPipeline = {
  resize: mockPipelineResize,
};

jest.mock('fs', () => ({
  promises: {
    writeFile: mockFsPromisesWriteFile,
  },
}));

jest.mock('../../utils/thrown-exception', () => ({
  thrownExceptionToError: mockThrownExceptionToError,
}));

const mockThumbnailSize = 20;

describe('thumbnailPipeline', () => {
  afterEach(jest.clearAllMocks);

  it('will request to resize image to thumbnail width', () => {
    thumbnailPipeline({
      pipeline: mockPipeline as any,
      thumbnailFilePath: '',
      thumbnailSize: mockThumbnailSize,
    });

    expect(mockPipelineResize).toBeCalledWith({ width: mockThumbnailSize });
  });

  it('will request to convert image to png with low quality and high compression levels', () => {
    thumbnailPipeline({
      pipeline: mockPipeline as any,
      thumbnailFilePath: '',
      thumbnailSize: mockThumbnailSize,
    });

    expect(mockPipelinePng).toBeCalledWith({ compressionLevel: 9, quality: 5 });
  });

  it('will convert the return from pipeline buffer to base64 and attempt to write to file', async () => {
    const mockPath = '/foo/bar';
    await thumbnailPipeline({
      pipeline: mockPipeline as any,
      thumbnailFilePath: mockPath,
      thumbnailSize: mockThumbnailSize,
    });

    expect(mockFsPromisesWriteFile).toBeCalledWith(
      mockPath,
      'data:image/png;base64,Zm9vQmFy',
    );
  });

  it('will call "thrownExceptionToError" on error', async () => {
    const testErrorMessage = 'oppsies';
    mockPipelineResize.mockImplementationOnce(() => {
      throw new Error(testErrorMessage);
    });

    await thumbnailPipeline({
      pipeline: mockPipeline as any,
      thumbnailFilePath: '',
      thumbnailSize: mockThumbnailSize,
    });

    expect(mockThrownExceptionToError).toBeCalledWith(
      new Error(testErrorMessage),
      'Error processing image thumbnail pipeline',
    );
  });
});
