import { existsSync, mkdirSync } from 'fs';
import path from 'path';

import { localCacheDirectoryPath } from '../caching/constants';

interface Props {
  thumbnailDirectoryPath: string;
  rootPublicImageDirectory: string;
  optimisedImageSizes: number[];
}

/**
 * check if required directories exist where optimised images will live. If not create
 * them in preparation.
 */
export const validateOptimisedImageDirectories = ({
  thumbnailDirectoryPath,
  rootPublicImageDirectory,
  optimisedImageSizes,
}: Props) => {
  // if thumbnail directory doesn't exist then recursively create
  if (!existsSync(thumbnailDirectoryPath))
    mkdirSync(thumbnailDirectoryPath, { recursive: true });

  // if any of the image size directories doesn't exist then recursively create
  for (const imageSize of optimisedImageSizes) {
    const imageSizeDirectoryPath = path.join(
      rootPublicImageDirectory,
      imageSize.toString(),
    );
    if (!existsSync(imageSizeDirectoryPath))
      mkdirSync(imageSizeDirectoryPath, { recursive: true });
  }

  // if
  if (!existsSync(localCacheDirectoryPath))
    mkdirSync(localCacheDirectoryPath, { recursive: true });
};
