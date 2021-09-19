import { promises } from 'fs';
import path from 'path';

import sharp from 'sharp';
import VError from 'verror';

import {
  processedImageMetaDataCache,
  localDeveloperImageCache,
} from '../../caching';
import { cliProgressBar } from '../../cli-progress';
import { getStaticImageConfig } from '../../static-image-config';
import { getFileContentShortHashByPath } from '../../utils/image-fingerprinting';
import { thrownExceptionToLoggerAsError } from '../../utils/thrown-exception';
import { rootPublicImageDirectory, thumbnailDirectoryPath } from '../constants';
import type { ImageFileSystemMetaData } from '../image-files-meta-data';

import { optimiseImageBySizePipeline } from './optimise-image-by-size-pipeline';
import { thumbnailPipeline } from './thumbnail-pipeline';

interface Props {
  imagesFileSystemMetaData: ImageFileSystemMetaData[];
}

/**
 * Iterates through all images, as detailed in the images meta data argument, and create all
 * the optimised variants that might include:
 *
 * * thumbnails
 * * various image sizes in PNG format
 * * the same image sizes in WEBP format
 */
export const optimiseImages = async ({ imagesFileSystemMetaData }: Props) => {
  const {
    optimisedImageSizes,
    thumbnailSize,
    optimisedImageCompressionLevel,
    optimisedImageColourQuality,
  } = getStaticImageConfig();

  const progressBar = cliProgressBar.getInstance();

  await Promise.all(
    imagesFileSystemMetaData.map(async (imageFsMeta) => {
      try {
        // initialise sharp from image path
        const pipeline = sharp(imageFsMeta.path);
        // get image size metadata for use to prevent layout shift on load
        const imageMetaData = await pipeline.metadata();
        // if unable to determine width to throw error as will not be able to
        // process image without this
        if (!imageMetaData.width) {
          throw new VError('Unable to determine image width');
        }
        // get image content hash (to break browser cache on image edit)
        const imageContentHash = await getFileContentShortHashByPath(
          imageFsMeta.path,
        );

        // create thumbnail for image
        const thumbnailFilePath = `${thumbnailDirectoryPath}${path.sep}${imageFsMeta.uniqueImageName}.base64`;

        await thumbnailPipeline({
          pipeline: pipeline.clone(),
          thumbnailFilePath,
          thumbnailSize,
        });

        // create all other image sizes
        if (optimisedImageSizes.length > 0) {
          await Promise.all(
            optimisedImageSizes.map(async (optimisedImageSize) => {
              // if original image width is less than desired optimised image size then return
              if (
                !imageMetaData.width ||
                imageMetaData.width <= optimisedImageSize
              ) {
                return;
              }

              // create optimised variant of image in the current iterated image size
              const imageSizeFilePath = `${rootPublicImageDirectory}${path.sep}${optimisedImageSize}${path.sep}${imageContentHash}${imageFsMeta.uniqueImageName}.${imageFsMeta.type}`;
              await optimiseImageBySizePipeline({
                imageSizeFilePath,
                optimisedImageColourQuality,
                optimisedImageCompressionLevel,
                optimisedImageSize,
                pipeline: pipeline.clone(),
              });
            }),
          );
        }

        // on successful processing of image to update local dev cache
        const lastTimeFileUpdatedInMs = await (
          await promises.stat(imageFsMeta.path)
        ).mtimeMs;
        localDeveloperImageCache.addCacheAttribute({
          imageCacheKey: imageFsMeta.uniqueImageName,
          lastTimeFileUpdatedInMs,
        });

        // on successful processing of images to save image meta in cache
        processedImageMetaDataCache.addCacheAttribute({
          imageAttributes: {
            height: imageMetaData.height,
            imageHash: imageContentHash,
            width: imageMetaData.width,
          },
          imageCacheKey: imageFsMeta.uniqueImageName,
        });

        // and update the progress bar
        progressBar.increment();
      } catch (exception) {
        // as an attempt to optimised a single image is not reason to stop the whole process we only
        // want to log out the error (and store in the error log file here) before attempting the next.
        thrownExceptionToLoggerAsError(
          exception,
          `Image of type "${imageFsMeta.type}" at path "${imageFsMeta.path}" cannot be resized`,
        );
      }
    }),
  );

  // save caches to file system
  localDeveloperImageCache.saveCacheToFileSystem();
  processedImageMetaDataCache.saveCacheToFileSystem();
};
