const mockGetFileContentShortHashByPath = jest.fn();

import { validateImageCache } from './validate-image-cache';

jest.mock('../../utils/image-fingerprinting', () => ({
  getFileContentShortHashByPath: mockGetFileContentShortHashByPath,
}));

describe('validateImageCache', () => {
  afterEach(jest.clearAllMocks);

  it('will return false when there is no existing processed image meta data', async () => {
    const response = await validateImageCache('', '');

    expect(response).toBeFalsy();
    expect(mockGetFileContentShortHashByPath).not.toBeCalled();
  });

  it('will return false when existing processed image meta data has no property key matching the image CacheKey', async () => {
    const response = await validateImageCache('', 'baz', {
      foo: { imageHash: '' },
    });

    expect(response).toBeFalsy();
    expect(mockGetFileContentShortHashByPath).not.toBeCalled();
  });

  it('will return false when existing processed image meta data has cache but miss matched content hash', async () => {
    const testFilePath = '/pot/a/toe';
    mockGetFileContentShortHashByPath.mockImplementation(() =>
      Promise.resolve('aaa'),
    );

    expect(
      await validateImageCache(testFilePath, 'baz', {
        baz: { imageHash: 'bbb' },
      }),
    ).toBeFalsy();
    expect(mockGetFileContentShortHashByPath).toBeCalledWith(testFilePath);
  });

  it('will return true when existing processed image meta data has cache and matching content hash', async () => {
    const testFilePath = '/pot/a/toe';
    const testImageContentHash = 'qwerty';
    mockGetFileContentShortHashByPath.mockImplementation(() =>
      Promise.resolve(testImageContentHash),
    );

    expect(
      await validateImageCache(testFilePath, 'baz', {
        baz: { imageHash: testImageContentHash },
      }),
    ).toBeTruthy();
    expect(mockGetFileContentShortHashByPath).toBeCalledWith(testFilePath);
  });
});
