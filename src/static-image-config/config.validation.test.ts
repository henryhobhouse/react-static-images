const mockUserConfigFileName = 'fooBar.js';
const mockErrorLogger = jest.fn();

import { validateUserConfig } from './config-validation';

jest.mock('./default-config', () => ({
  defaultConfig: {
    applicationPublicDirectory: 'public',
    excludedDirectories: [],
    imageFormats: ['png', 'tiff'],
    imagesBaseDirectory: '/fake/directory',
    optimisedImageColourQuality: 100,
    optimisedImageCompressionLevel: 9,
    optimisedImageSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    staticImageMetaDirectory: '/static-images-data',
    thumbnailSize: 20,
  },
}));

jest.mock('./config-constants', () => ({
  userConfigFileName: mockUserConfigFileName,
}));

jest.mock('../logger', () => ({
  logger: {
    error: mockErrorLogger,
  },
}));

const processExit = process.exit;

describe('config validation', () => {
  const exitMessage = 'exiting with process exit';
  beforeAll(() => {
    // @ts-expect-error mocking function
    process.exit = jest.fn().mockImplementation(() => {
      throw new Error(exitMessage);
    });
  });

  afterAll(() => {
    process.exit = processExit;
  });

  it('will throw an error if config is null', () => {
    const undefinedParameter = undefined;

    expect(() => validateUserConfig(undefinedParameter)).toThrow(exitMessage);
    expect(mockErrorLogger).toHaveBeenCalledWith(
      `Your ${mockUserConfigFileName} config file is not exporting an object`,
    );
  });

  it('will throw an error if config is a number', () => {
    expect(() => validateUserConfig(1)).toThrow(exitMessage);
    expect(mockErrorLogger).toHaveBeenCalledWith(
      `Your ${mockUserConfigFileName} config file is not exporting an object`,
    );
  });

  it('will throw an error if config is a string', () => {
    expect(() => validateUserConfig('')).toThrow(exitMessage);
    expect(mockErrorLogger).toHaveBeenCalledWith(
      `Your ${mockUserConfigFileName} config file is not exporting an object`,
    );
  });

  it('will throw an error if config is a array', () => {
    expect(() => validateUserConfig([])).toThrow(exitMessage);
    expect(mockErrorLogger).toHaveBeenCalledWith(
      `Your ${mockUserConfigFileName} config file is not exporting an object`,
    );
  });

  it('will throw an error if config has a non-valid key', () => {
    const invalidKey = 'foo';
    expect(() => validateUserConfig({ [invalidKey]: 'bar' })).toThrow(
      exitMessage,
    );
    expect(mockErrorLogger).toHaveBeenCalledWith(
      `You are using an invalid value in "${invalidKey}" in your ${mockUserConfigFileName} config file. Please check the documentation.`,
    );
  });
});
