import path from 'path';

import {
  currentWorkingDirectory,
  libraryPackageName,
  staticImageMetaDirectoryPath,
} from '../constants';

const imagesMetaDataFileName = 'image-meta-data.json';
const localDevelopmentCacheFileName = 'images-last-updated.json';
const configCacheFileName = 'build-cache.json';

export const processedImageMetaDataFilePath = path.join(
  staticImageMetaDirectoryPath,
  imagesMetaDataFileName,
);

export const configCacheFilePath = path.join(
  staticImageMetaDirectoryPath,
  configCacheFileName,
);

export const localCacheDirectoryPath = path.join(
  currentWorkingDirectory,
  'node_modules',
  '.cache',
  libraryPackageName,
);

export const localDeveloperCacheFilePath = path.join(
  localCacheDirectoryPath,
  localDevelopmentCacheFileName,
);
