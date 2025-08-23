const mockMkdirSync = jest.fn();
const mockExistsSync = jest.fn();

import path from 'path';

import { validateRequiredDirectoryPaths } from './validate-required-directory-paths';

const currentWorkingDirectory = process.cwd();
const testDirectory = path.join(currentWorkingDirectory, 'test');
const demoDirectoryRoot = path.join(testDirectory, 'foo');
const demoDirectory = path.join(demoDirectoryRoot, 'bar');

jest.mock('fs', () => ({
  existsSync: mockExistsSync,
  mkdirSync: mockMkdirSync,
}));

describe('validateRequiredDirectoryPaths', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('will do nothing if all directories already exists', () => {
    mockExistsSync.mockReturnValue(true);

    validateRequiredDirectoryPaths({
      directoryPaths: [currentWorkingDirectory],
      optimisedImageSizes: [100],
      rootPublicImageDirectory: currentWorkingDirectory,
    });

    expect(mockMkdirSync).not.toHaveBeenCalled();
  });

  it('will check if directory in directory paths list exists and create them if not', () => {
    mockExistsSync
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValue(true);

    validateRequiredDirectoryPaths({
      directoryPaths: [demoDirectory, demoDirectoryRoot],
      optimisedImageSizes: [],
      rootPublicImageDirectory: currentWorkingDirectory,
    });

    expect(mockMkdirSync).toHaveBeenCalledWith(demoDirectoryRoot, {
      recursive: true,
    });
    expect(mockMkdirSync).toHaveBeenCalledWith(demoDirectory, {
      recursive: true,
    });
  });

  it('will check if all image size directories exists and create them if not', () => {
    mockExistsSync
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValue(true);

    const imageSizes = [100, 200];
    validateRequiredDirectoryPaths({
      directoryPaths: [currentWorkingDirectory],
      optimisedImageSizes: imageSizes,
      rootPublicImageDirectory: demoDirectory,
    });

    for (const [index, imageSize] of imageSizes.entries()) {
      expect(mockMkdirSync.mock.calls[index]).toEqual([
        path.join(demoDirectory, imageSize.toString()),
        { recursive: true },
      ]);
    }
  });
});
