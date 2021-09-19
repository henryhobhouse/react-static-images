const mockMkdirSync = jest.fn();
const mockExistsSync = jest.fn();

import path from 'path';

import { localCacheDirectoryPath } from '../caching/constants';

import { validateOptimisedImageDirectories } from './validate-optimised-image-directories';

const currentWorkingDirectory = process.cwd();
const testDirectory = path.join(currentWorkingDirectory, 'test');
const demoDirectoryRoot = path.join(testDirectory, 'foo');
const demoDirectory = path.join(demoDirectoryRoot, 'bar');

jest.mock('fs', () => ({
  existsSync: mockExistsSync,
  mkdirSync: mockMkdirSync,
}));

describe('validateOptimisedImageDirectories', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('will do nothing if all directories already exists', () => {
    mockExistsSync.mockReturnValue(true);

    validateOptimisedImageDirectories({
      optimisedImageSizes: [100],
      rootPublicImageDirectory: currentWorkingDirectory,
      thumbnailDirectoryPath: currentWorkingDirectory,
    });

    expect(mockMkdirSync).not.toHaveBeenCalled();
  });

  it('will check if thumbnail directory exists and create one if not', () => {
    mockExistsSync.mockReturnValueOnce(false).mockReturnValue(true);

    validateOptimisedImageDirectories({
      optimisedImageSizes: [],
      rootPublicImageDirectory: currentWorkingDirectory,
      thumbnailDirectoryPath: demoDirectory,
    });

    expect(mockMkdirSync).toBeCalledWith(demoDirectory, { recursive: true });
  });

  it('will check if all image size directories exists and create them if not', () => {
    mockExistsSync
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValue(true);

    const imageSizes = [100, 200];
    validateOptimisedImageDirectories({
      optimisedImageSizes: imageSizes,
      rootPublicImageDirectory: demoDirectory,
      thumbnailDirectoryPath: currentWorkingDirectory,
    });

    for (const [index, imageSize] of imageSizes.entries()) {
      expect(mockMkdirSync.mock.calls[index]).toEqual([
        path.join(demoDirectory, imageSize.toString()),
        { recursive: true },
      ]);
    }
  });

  it('will check if local developer cache directory exists and creates it if not', () => {
    mockExistsSync
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValue(false);

    const imageSizes = [100];
    validateOptimisedImageDirectories({
      optimisedImageSizes: imageSizes,
      rootPublicImageDirectory: demoDirectory,
      thumbnailDirectoryPath: currentWorkingDirectory,
    });

    expect(mockMkdirSync).toBeCalledWith(localCacheDirectoryPath, {
      recursive: true,
    });
  });
});
