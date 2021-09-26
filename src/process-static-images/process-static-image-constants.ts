import { getStaticImageConfig } from '../static-image-config';

const { applicationPublicDirectory, staticImageMetaDirectory } =
  getStaticImageConfig();

export const baseExcludedDirectories = [
  'node_modules',
  applicationPublicDirectory,
  staticImageMetaDirectory,
];

export const thumbnailFileExtension = 'base64';
