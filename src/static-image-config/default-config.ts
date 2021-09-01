import { imageFormat } from './constants';
import type { ImageConfig } from './static-image-config';

export const defaultConfig: ImageConfig = {
  imageFormats: [
    imageFormat.png,
    imageFormat.jpeg,
    imageFormat.avif,
    imageFormat.tiff,
    imageFormat.webp,
  ],
  imagesBaseDirectory: process.cwd(),
  optimisedImageColourQuality: 100,
  optimisedImageCompressionLevel: 9,
  optimisedImageSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  thumbnailSize: 20,
};
