import { promises } from 'fs';
import path from 'path';

import type { ProcessedImageMetaDataCacheAttributes } from '../../caching';
import {
  localDeveloperImageCache,
  processedImageMetaDataCache,
} from '../../caching';
import { currentWorkingDirectory, imagesBaseDirectory } from '../../constants';
import type { ImageFormat } from '../../static-image-config';
import { getStaticImageConfig, imageFormat } from '../../static-image-config';
import { createUniqueFileNameFromPath } from '../../utils/data-fingerprinting';
import { baseExcludedDirectories } from '../process-static-image-constants';

import { validateImageCached } from './validate-image-cached';

export interface ImageFileSystemMetaData {
  path: string;
  uniqueImageName: string;
  fileName: string;
  type: ImageFormat;
}

export interface InvalidImages {
  name: string;
  hash: string;
}

/**
 * Programmatically builds regex matcher for image types based on array of accepted image types
 * passed in arguments.
 */
const createImageFormatTypeMatcher = (fileTypes: ImageFormat[]) => {
  const buildFileTypesString = () => {
    let fileTypesString = '';

    for (const fileType of fileTypes) {
      fileTypesString = fileTypesString
        ? `${fileTypesString}|${fileType}`
        : fileType;
    }

    // if file type includes a derivative of jpg to change matcher to include both jpg and jpeg
    const fileTypesWithAllJpegVariants = fileTypesString.replace(
      /jpe?g/i,
      'jpe?g',
    );

    return fileTypesWithAllJpegVariants;
  };

  // create regex matcher object to look for any of the image types at end of file name prefixed with
  // a period i.e. `.png` or `.webp`
  const imageFormatTypeMatcher = new RegExp(
    `(?<=[.])(${buildFileTypesString()})$`,
    'i',
  );

  return imageFormatTypeMatcher;
};

/**
 * Recursively iterates through the base image directory (from the config) and checks if any image files with
 * accepted format types in each directory. If it finds one then to extract meta data to include:
 *
 * * image file name
 * * unique image file name (by hashing path)
 * * image path
 * * image type
 */
export const getImageFilesMetaData = async () => {
  const { imageFormats, excludedDirectories } = getStaticImageConfig();

  let totalImagesCached = 0;
  let totalImagesFound = 0;
  const cachedImagesToValidate: Record<
    string,
    undefined | ProcessedImageMetaDataCacheAttributes
  > = {
    ...processedImageMetaDataCache.currentCache,
  };

  const allExcludedDirectories = [
    ...baseExcludedDirectories,
    ...excludedDirectories,
  ];

  const imageFilesMetaData: ImageFileSystemMetaData[] = [];

  // if no accepted image file types throw error as should always expect at least one
  if (imageFormats.length === 0)
    throw new Error('There needs to be at least one accepted image format');

  const imageFileTypeRegex = createImageFormatTypeMatcher(imageFormats);

  const recursiveSearchForImages = async (directoryPath: string) => {
    const dirents = await promises.readdir(directoryPath, {
      withFileTypes: true,
    });

    const imageDirents = dirents.filter((dirent) =>
      dirent.name.match(imageFileTypeRegex),
    );

    if (imageDirents.length > 0) {
      await Promise.all(
        imageDirents.map(async (imageDirent) => {
          const imageFilePath = `${directoryPath}${path.sep}${imageDirent.name}`;
          const imageFormatRegExMatchArray =
            imageDirent.name.match(imageFileTypeRegex);

          // if the dirent isn't an accepted image file type then return to check next or exit
          if (!imageFormatRegExMatchArray?.length) return;

          totalImagesFound += 1;

          const imageFormatType = imageFormatRegExMatchArray?.[0];

          // To avoid collisions with images of same name but different paths we take a simple
          // hash of the path as a prefix to ensure a unique name when copied to the web app public directory.
          const uniqueImageName = createUniqueFileNameFromPath(
            imageFilePath,
            imageDirent.name.replace(`.${imageFormatType}`, ''),
          );

          // set value as undefined rather than delete property to avoid de-optimising the JS engine
          // (fast vs slow properties https://v8.dev/blog/fast-properties#:~:text=Fast%20vs.%20slow%20properties)
          if (cachedImagesToValidate[uniqueImageName])
            cachedImagesToValidate[uniqueImageName] = undefined;

          const fileType = /jpg/i.test(imageFormatType)
            ? imageFormat.jpeg
            : imageFormatType.toLowerCase();

          const hasValidImageCache = await validateImageCached(
            imageFilePath,
            uniqueImageName,
          );

          if (hasValidImageCache) totalImagesCached += 1;

          if (fileType && !hasValidImageCache) {
            const imageMeta = {
              fileName: imageDirent.name,
              path: imageFilePath,
              type: fileType as ImageFormat,
              uniqueImageName,
            };
            imageFilesMetaData.push(imageMeta);
          }
        }),
      );
    }
    await Promise.all(
      dirents.map(async (dirent) => {
        const filePath = `${directoryPath}${path.sep}${dirent.name}`;

        // return if reviewing an excluded directory to avoid re-processing images or images the user doesn't want processing
        for (const excludedDirectory of allExcludedDirectories) {
          if (
            filePath ===
            `${currentWorkingDirectory}${path.sep}${excludedDirectory}`
          )
            return;
        }

        const isDirectory = dirent.isDirectory();

        if (isDirectory) await recursiveSearchForImages(filePath);
      }),
    );
  };

  await recursiveSearchForImages(imagesBaseDirectory);

  // filter out properties that still have an original image associated and map the remainder
  // to create an array of pointers of invalid cache that needs to be removed
  const invalidCachedImages: InvalidImages[] = Object.entries(
    cachedImagesToValidate,
  )
    .filter((cachedImages) => !!cachedImages[1])
    .map((filterCachedImage) => ({
      hash: filterCachedImage[1]?.imageHash ?? '',
      name: filterCachedImage[0],
    }));

  localDeveloperImageCache.saveCacheToFileSystem();

  return {
    imageFilesMetaData,
    invalidCachedImages,
    totalImagesCached,
    totalImagesFound,
  };
};
