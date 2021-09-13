import path from 'path';

import { getStaticImageConfig } from '../static-image-config';

const { applicationPublicDirectory, thumbnailSize, staticImageMetaDirectory } =
  getStaticImageConfig();

const currentWorkingDirectory = process.cwd();

const optimisedImagesPublicDirectoryRoot = '/static-images';

export const rootPublicImageDirectory = path.join(
  currentWorkingDirectory,
  applicationPublicDirectory,
  optimisedImagesPublicDirectoryRoot,
);

export const thumbnailDirectoryPath = path.join(
  currentWorkingDirectory,
  staticImageMetaDirectory,
  thumbnailSize.toString(),
);

export const baseExcludedDirectories = [
  'node_modules',
  applicationPublicDirectory,
  staticImageMetaDirectory,
];
