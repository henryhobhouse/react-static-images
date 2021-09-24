import path from 'path';

import { getStaticImageConfig } from './static-image-config';

const { applicationPublicDirectory, thumbnailSize, staticImageMetaDirectory } =
  getStaticImageConfig();
const optimisedImagesPublicDirectoryRoot = '/static-images';

export const currentWorkingDirectory = process.cwd();
export const libraryPackageName = 'react-static-images';

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
