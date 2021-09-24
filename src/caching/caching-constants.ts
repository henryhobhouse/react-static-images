import path from 'path';

import {
  currentWorkingDirectory,
  libraryPackageName,
  staticImageMetaDirectoryPath,
} from '../constants';

export const imagesMetaDataFileName = 'image-meta-data.json';
export const localDevelopmentCacheFileName = 'images-last-updated.json';

export const processedImageMetaDataFilePath = path.join(
  staticImageMetaDirectoryPath,
  imagesMetaDataFileName,
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
