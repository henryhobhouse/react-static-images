const mockMkdirSync = jest.fn();

import fs from 'fs';
import path from 'path';

import del from 'del';

import { validateOptimisedImageDirectories } from './validate-optimised-image-directories';

const currentWorkingDirectory = process.cwd();
const testDirectory = path.join(currentWorkingDirectory, 'test');
const demoDirectoryRoot = path.join(testDirectory, 'foo');
const demoDirectory = path.join(demoDirectoryRoot, 'bar');

describe('validateOptimisedImageDirectories', () => {
  beforeAll(() => {
    del(demoDirectoryRoot);
  });

  afterEach(() => {
    del(demoDirectoryRoot);
  });

  it('will do nothing if thumbnail directory already exists', () => {
    jest.mock('fs', () => {
      const originalModule = jest.requireActual('fs');

      return {
        ...originalModule,
        mkdirSync: mockMkdirSync,
      };
    });

    validateOptimisedImageDirectories({
      optimisedImageSizes: [],
      rootPublicImageDirectory: currentWorkingDirectory,
      thumbnailDirectoryPath: currentWorkingDirectory,
    });

    expect(mockMkdirSync).not.toHaveBeenCalled();
  });

  it('will do nothing if image size directory already exists', () => {
    const testImageSize = 100;
    const testImageDirectory = path.join(
      demoDirectoryRoot,
      testImageSize.toString(),
    );

    fs.mkdirSync(testImageDirectory, { recursive: true });
    const makeDirectorySpy = jest.spyOn(fs, 'mkdirSync');

    validateOptimisedImageDirectories({
      optimisedImageSizes: [testImageSize],
      rootPublicImageDirectory: demoDirectoryRoot,
      thumbnailDirectoryPath: currentWorkingDirectory,
    });

    expect(makeDirectorySpy).not.toHaveBeenCalled();

    del(testImageDirectory);
  });

  it('will check if thumbnail directory exists and create one if not', () => {
    validateOptimisedImageDirectories({
      optimisedImageSizes: [],
      rootPublicImageDirectory: currentWorkingDirectory,
      thumbnailDirectoryPath: demoDirectory,
    });

    expect(fs.existsSync(demoDirectory)).toBeTruthy();
  });

  it('will check if thumbnail directory exists and create one if not', () => {
    validateOptimisedImageDirectories({
      optimisedImageSizes: [],
      rootPublicImageDirectory: currentWorkingDirectory,
      thumbnailDirectoryPath: demoDirectory,
    });

    expect(fs.existsSync(demoDirectory)).toBeTruthy();
  });

  it('will check if all image size directories exists and create them if not', () => {
    const imageSizes = [100, 200];
    validateOptimisedImageDirectories({
      optimisedImageSizes: imageSizes,
      rootPublicImageDirectory: demoDirectory,
      thumbnailDirectoryPath: currentWorkingDirectory,
    });

    expect(
      fs.existsSync(path.join(demoDirectory, imageSizes[0].toString())),
    ).toBeTruthy();
    expect(
      fs.existsSync(path.join(demoDirectory, imageSizes[1].toString())),
    ).toBeTruthy();
  });
});
