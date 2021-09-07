/* eslint-disable unicorn/prefer-module */
import { existsSync } from 'fs';
import path from 'path';

import { validateUserConfig } from './config-validation';
import { imageFormat, userConfigFileName } from './constants';
import { defaultConfig } from './default-config';

export type ImageFormat = keyof typeof imageFormat;

export interface ImageConfig {
  /* options of 'jpeg' and 'png' (optional, default both) */
  imageFormats: ImageFormat[];
  /* width of thumbnail in px whilst retaining ration of original image */
  thumbnailSize: number;
  /* additional images of size (width in px) created if smaller than original for the browser to use in smaller viewports */
  optimisedImageSizes: number[];
  /* use the lowest number of colours needed to achieve given quality (optional, default 100) */
  optimisedImageColourQuality: number;
  /* zlib compression level, 0-9 (optional, default 9) */
  optimisedImageCompressionLevel: number;
  /* location of directory to recursively search for images to be optimised */
  imagesBaseDirectory: string;
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
