import path from 'path';

import { currentWorkingDirectory } from '../constants';
import { getStaticImageConfig } from '../static-image-config';

const { staticImageMetaDirectory } = getStaticImageConfig();
const libraryPackageName = 'react-static-images';

export const imagesMetaDataFileName = 'image-meta-data.json';

export const processedImageMetaDataFilePath = path.join(
  currentWorkingDirectory,
  staticImageMetaDirectory,
  imagesMetaDataFileName,
);

export const localDeveloperCacheFilePath = path.join(
  'node_modules',
  '.cache',
  libraryPackageName,
);
