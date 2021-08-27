import { imageFormat } from './image-config';
import type { ImageConfig } from './image-config';

export const defaultImageConfig: ImageConfig = {
  imageFormats: [imageFormat.png, imageFormat.jpeg],
  imagesBaseDirectory: process.cwd(),
  optimisedImageColourQuality: 100,
  optimisedImageCompressionLevel: 9,
  optimisedImageSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  thumbnailSize: 20,
};
