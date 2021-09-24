import { existsSync, mkdirSync } from 'fs';
import path from 'path';

interface Props {
  directoryPaths: string[];
  rootPublicImageDirectory: string;
  optimisedImageSizes: number[];
}

/**
 * check if required directories exist where optimised images will live. If not create
 * them in preparation.
 */
export const validateRequiredDirectoryPaths = ({
  directoryPaths,
  rootPublicImageDirectory,
  optimisedImageSizes,
}: Props) => {
  // if any of the image size directories doesn't exist then recursively create
  for (const imageSize of optimisedImageSizes) {
    const imageSizeDirectoryPath = path.join(
      rootPublicImageDirectory,
      imageSize.toString(),
    );
    if (!existsSync(imageSizeDirectoryPath))
      mkdirSync(imageSizeDirectoryPath, { recursive: true });
  }

  // process all other paths
  for (const path of directoryPaths) {
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
  }
};
