import { currentWorkingDirectory } from '../constants';

import { imageFormat } from './config-constants';
import type { ImageConfig } from './static-image-config';

export const defaultConfig: ImageConfig = {
  applicationPublicDirectory: 'public',
  excludedDirectories: [],
  imageFormats: [
    imageFormat.png,
    imageFormat.jpeg,
    imageFormat.tiff,
    imageFormat.webp,
  ],
  imagesBaseDirectory: currentWorkingDirectory,
  optimisedImageColourQuality: 100,
  optimisedImageCompressionLevel: 9,
  optimisedImageSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  staticImageMetaDirectory: '/static-images-data',
  thumbnailSize: 20,
};
