import { existsSync, promises } from 'fs';
import path from 'path';

import {
  localDeveloperImageCache,
  processedImageMetaDataCache,
} from '../../caching';
import {
  rootPublicImageDirectory,
  thumbnailDirectoryPath,
} from '../../constants';
import { imageFormat } from '../../static-image-config';
import type { InvalidImages } from '../image-files-meta-data';
import { thumbnailFileExtension } from '../process-static-image-constants';

export const removeInvalidImages = async (invalidImages: InvalidImages[]) => {
  for (const invalidImage of invalidImages) {
    processedImageMetaDataCache.removeCacheAttribute(invalidImage.name);
    localDeveloperImageCache.removeCacheAttribute(invalidImage.name);
  }

  await Promise.all(
    invalidImages.map(async (invalidImage) => {
      const dirents = await promises.readdir(rootPublicImageDirectory, {
        withFileTypes: true,
      });

      const optimisedImageFileName = `${invalidImage.hash}${invalidImage.name}.${imageFormat.png}`;

      // check all child directories in optimised image directory for image and remove if found
      for (const dirent of dirents) {
        if (dirent.isDirectory()) {
          const potentialImageFilePath = path.join(
            rootPublicImageDirectory,
            dirent.name,
            optimisedImageFileName,
          );
          if (existsSync(potentialImageFilePath))
            promises.unlink(potentialImageFilePath);
        }
      }

      // check thumbnail directory for base64 image file and remove if found
      const thumbnailFilePath = path.join(
        thumbnailDirectoryPath,
        `${invalidImage.name}.${thumbnailFileExtension}`,
      );
      if (existsSync(thumbnailFilePath)) promises.unlink(thumbnailFilePath);
    }),
  );
};
