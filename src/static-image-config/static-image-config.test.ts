/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/no-var-requires */
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';

import { userConfigFileName } from './config-constants';

const mockValidateUserConfig = jest.fn();
const mockFullConfig = {
  applicationPublicDirectory: 'pub',
  excludedDirectories: ['tay'],
  imageFormats: ['jpeg'],
  imagesBaseDirectory: 'foo bar',
  optimisedImageColourQuality: 1,
  optimisedImageCompressionLevel: 4,
  optimisedImageSizes: [10],
  staticImageMetaDirectory: './qwerty',
  thumbnailSize: 3,
};
const mockDefaultConfig = {
  applicationPublicDirectory: 'public',
  excludedDirectories: [],
  imageFormats: ['png', 'tiff'],
  imagesBaseDirectory: '/fake/directory',
  optimisedImageColourQuality: 100,
  optimisedImageCompressionLevel: 9,
  optimisedImageSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  staticImageMetaDirectory: '/static-images-data',
  thumbnailSize: 20,
};
const mockPartialConfig = {
  imagesBaseDirectory: 'foo bar',
  optimisedImageSizes: [10],
  thumbnailSize: 3,
};

const configFilePath = path.resolve(process.cwd(), userConfigFileName);
const mockConfigModule = (config: Record<string, unknown>) =>
  `module.exports = ${JSON.stringify(config)}`;
const relativePathToStaticImageConfig = './static-image-config';

jest.mock('./config-validation', () => ({
  validateUserConfig: mockValidateUserConfig,
}));

jest.mock('./default-config', () => ({
  defaultConfig: mockDefaultConfig,
}));

describe('Static image config', () => {
  beforeEach(() => {
    jest.resetModules();
    if (existsSync(configFilePath)) unlinkSync(configFilePath);
  });

  afterAll(async () => {
    if (existsSync(configFilePath)) unlinkSync(configFilePath);
  });

  it('returns the default config when no user config file present', async () => {
    const { getStaticImageConfig } = await import(
      relativePathToStaticImageConfig
    );
    expect(getStaticImageConfig()).toEqual(mockDefaultConfig);
  });

  // I cannot find a way to reset require/import cache of fs as imported into the tested module (not this test module)
  // as such we can only run one test with a user config file present at this stage.
  it.skip('returns a user config is present', async () => {
    writeFileSync(configFilePath, mockConfigModule(mockFullConfig));
    const { getStaticImageConfig } = await import(
      relativePathToStaticImageConfig
    );
    expect(getStaticImageConfig()).toEqual(mockFullConfig);
  });

  it('returns a merged config if only partial user config is present', async () => {
    writeFileSync(configFilePath, mockConfigModule(mockPartialConfig));
    const { getStaticImageConfig } = await import(
      relativePathToStaticImageConfig
    );
    expect(getStaticImageConfig()).toEqual({
      ...mockDefaultConfig,
      ...mockPartialConfig,
    });
  });

  it('runs validation if user config if present', async () => {
    // not strictly required as previous test already sets the file (and by extension caches it) however adding
    // to ensure test is always standalone
    writeFileSync(configFilePath, mockConfigModule(mockPartialConfig));
    await import(relativePathToStaticImageConfig);
    expect(mockValidateUserConfig).toBeCalledWith(mockPartialConfig);
  });
});
