const mockInfoLogger = jest.fn();
const mockGetImageMetaData = jest
  .fn()
  .mockImplementation(() => ({ imageFilesMetaData: [] }));

import { processStaticImages } from './process-static-images';

jest.mock('../logger', () => ({
  logger: {
    info: mockInfoLogger,
  },
}));

jest.mock('./get-images-meta-data', () => ({
  getImageMetaData: mockGetImageMetaData,
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
      `${mockImageMetaDatas.length} total unprocessed images`,
    );
  });
});
