import path from 'path';

import { getStaticImageConfig } from './static-image-config';
import { trimSeparators } from './utils/path';

const {
  applicationPublicDirectory: rawApplicationPublicDirectory,
  thumbnailSize,
  staticImageMetaDirectory: rawStaticImageMetaDirectory,
  imagesBaseDirectory: rawImagesBaseDirectory,
} = getStaticImageConfig();

export const optimisedImagesPublicDirectoryRoot = 'static-images';
export const currentWorkingDirectory = process.cwd();
export const libraryPackageName = 'react-static-images';
export const originalImageDirectory = 'original';
export const applicationPublicDirectory = trimSeparators(
  path.normalize(rawApplicationPublicDirectory),
);
export const staticImageMetaDirectory = trimSeparators(
  path.normalize(rawStaticImageMetaDirectory),
);
export const imagesBaseDirectory = trimSeparators(
  path.normalize(rawImagesBaseDirectory),
);

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

export const originalImageDirectoryPath = path.join(
  staticImageMetaDirectoryPath,
  originalImageDirectory,
);
