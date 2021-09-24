import path from 'path';

import { currentWorkingDirectory, libraryPackageName } from '../constants';
import { getStaticImageConfig } from '../static-image-config';

const { staticImageMetaDirectory } = getStaticImageConfig();

export const imagesMetaDataFileName = 'image-meta-data.json';
export const localDevelopmentCacheFileName = 'images-last-updated.json';

export const processedImageMetaDataFilePath = path.join(
  currentWorkingDirectory,
  staticImageMetaDirectory,
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
