/* eslint-disable unicorn/prefer-module */
import { existsSync } from 'fs';
import path from 'path';

import { validateUserConfig } from './config-validation';
import { imageFormat, userConfigFileName } from './constants';
import { defaultConfig } from './default-config';

export type ImageFormat = keyof typeof imageFormat;

export interface ImageConfig {
  /* options of 'jpeg' and 'png' (default both) */
  imageFormats: ImageFormat[];
  /* width of thumbnail in px whilst retaining ration of original image (default 20(px) */
  thumbnailSize: number;
  /* additional images of size (width in px) created if smaller than original for the browser to use in smaller viewports (default [640, 750, 828, 1080, 1200, 1920, 2048, 3840]) */
  optimisedImageSizes: number[];
  /* use the lowest number of colours needed to achieve given quality (default 100) */
  optimisedImageColourQuality: number;
  /* zlib compression level, 0-9 (default 9) */
  optimisedImageCompressionLevel: number;
  /* location of directory to recursively search for images to be optimised. (default current working directory) */
  imagesBaseDirectory: string;
  /* location of directory that allows public assets for your web app. ('/public') */
  applicationPublicDirectory: string;
  /* location of directory to data that might not be added directory to 'applicationPublicDirectory' like (base64) thumbnails or image meta data */
  staticImageMetaDirectory: string;
  /* any directories that should be ignored by the library when searching for images to process */
  excludedDirectories: string[];
}

const configFilePath = path.resolve(process.cwd(), userConfigFileName);

const createConfig = () => {
  if (existsSync(configFilePath)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const userConfig = require(configFilePath);

    validateUserConfig(userConfig);

    return {
      ...defaultConfig,
      ...userConfig,
    } as ImageConfig;
  }

  return defaultConfig;
};

const configSingleton = createConfig();

export const getStaticImageConfig = () => configSingleton;
