import path from 'path';

import { currentWorkingDirectory } from '../constants';
import { getStaticImageConfig } from '../static-image-config';

const { applicationPublicDirectory, thumbnailSize, staticImageMetaDirectory } =
  getStaticImageConfig();

const optimisedImagesPublicDirectoryRoot = '/static-images';

export const rootPublicImageDirectory = path.join(
  currentWorkingDirectory,
  applicationPublicDirectory,
  optimisedImagesPublicDirectoryRoot,
);

export const staticImageMetaDirectoryPath = path.join(
  currentWorkingDirectory,
  staticImageMetaDirectory,
);

export const thumbnailDirectoryPath = path.join(
  staticImageMetaDirectoryPath,
  thumbnailSize.toString(),
);

export const baseExcludedDirectories = [
  'node_modules',
  applicationPublicDirectory,
  staticImageMetaDirectory,
];
