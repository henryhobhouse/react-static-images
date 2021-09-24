const mockUserConfigFileName = 'fooBar.js';

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

describe('config validation', () => {
  it('will throw an error if config is null', () => {
    // eslint-disable-next-line unicorn/no-null
    expect(() => validateUserConfig(null)).toThrowError(
      `Your ${mockUserConfigFileName} config file is not exporting an object`,
    );
  });

  it('will throw an error if config is a number', () => {
    expect(() => validateUserConfig(1)).toThrowError(
      `Your ${mockUserConfigFileName} config file is not exporting an object`,
    );
  });

  it('will throw an error if config is a string', () => {
    expect(() => validateUserConfig('')).toThrowError(
      `Your ${mockUserConfigFileName} config file is not exporting an object`,
    );
  });

  it('will throw an error if config is a array', () => {
    expect(() => validateUserConfig([])).toThrowError(
      `Your ${mockUserConfigFileName} config file is not exporting an object`,
    );
  });

  it('will throw an error if config has a non-valid key', () => {
    const invalidKey = 'foo';
    expect(() => validateUserConfig({ [invalidKey]: 'bar' })).toThrowError(
      `You are using an invalid value in "${invalidKey}" in your ${mockUserConfigFileName} config file`,
    );
  });
});
