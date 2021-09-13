const mockInfoLogger = jest.fn();
const mockGetImageMetaData = jest
  .fn()
  .mockImplementation(() => ({ imageFilesMetaData: [] }));
const mockProgressBarStart = jest.fn();
const mockProgressBar = jest.fn().mockReturnValue({
  start: mockProgressBarStart,
  stop: jest.fn(),
});

import { processStaticImages } from './process-static-images';

jest.mock('../logger', () => ({
  logger: {
    info: mockInfoLogger,
    log: jest.fn(),
  },
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

jest.mock('./optimise-images', () => ({
  optimiseImages: jest.fn().mockImplementation(() => Promise.resolve()),
}));

describe('processStaticImages', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('will request to get all images meta data with no arguements', async () => {
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
      `${mockImageMetaDatas.length} total unprocessed images. Processing...`,
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
});
