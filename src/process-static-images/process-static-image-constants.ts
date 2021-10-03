import {
  applicationPublicDirectory,
  staticImageMetaDirectory,
} from '../constants';

export const baseExcludedDirectories = [
  'node_modules',
  applicationPublicDirectory,
  staticImageMetaDirectory,
];

export const thumbnailFileExtension = 'base64';
