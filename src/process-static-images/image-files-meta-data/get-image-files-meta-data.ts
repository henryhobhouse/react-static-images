import { promises } from 'fs';
import path from 'path';

import {
  getStaticImageConfig,
  imageFormat,
  ImageFormat,
} from '../../static-image-config';
import { createUniqueFileNameFromPath } from '../../utils/image-fingerprinting';

export interface ImageFileSystemMetaData {
  path: string;
  uniqueImageName: string;
  fileName: string;
  type: ImageFormat;
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
    `(?<=.)(${buildFileTypesString()})$`,
    'i',
  );

  return imageFormatTypeMatcher;
};

/**
 * Recursively iterates through the base image directory (form the config) and checks if any image files with
 * accepted format types in each directory. If it finds one then to extract meta data to include:
 *
 * * image file name
 * * unique image file name (by hashing path)
 * * image path
 * * image type
 */
export const getImageFilesMetaData = async () => {
  const { imageFormats, imagesBaseDirectory, applicationPublicDirectory } =
    getStaticImageConfig();
  const applicationPublicDirectoryPath = path.resolve(
    process.cwd(),
    applicationPublicDirectory,
  );

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
      for (const imageDirent of imageDirents) {
        const imageFilePath = `${directoryPath}/${imageDirent.name}`;
        const imageFormatRegExMatchArray =
          imageDirent.name.match(imageFileTypeRegex);

        // if the dirent isn't an accepted image file type then return to check next or exit
        if (!imageFormatRegExMatchArray?.length) return;

        const imageFormatType = imageFormatRegExMatchArray?.[0];

        // To avoid collisions with images of same name but different paths we take a simple
        // hash of the path as a prefix to ensure a unique name when copied to the web app public directory.
        const uniqueImageName = createUniqueFileNameFromPath(
          imageFilePath,
          imageDirent.name.replace(`.${imageFormatType}`, ''),
        );

        const fileType = /jpg/i.test(imageFormatType)
          ? imageFormat.jpeg
          : imageFormatType.toLowerCase();

        if (fileType) {
          const imageMeta = {
            fileName: imageDirent.name,
            path: imageFilePath,
            type: fileType as ImageFormat,
            uniqueImageName,
          };
          imageFilesMetaData.push(imageMeta);
        }
      }
    }
    await Promise.all(
      dirents.map(async (dirent) => {
        const filePath = `${directoryPath}/${dirent.name}`;

        // return if reviewing public directory to avoid re-processing images
        if (applicationPublicDirectoryPath === filePath) return;

        const isDirectory = dirent.isDirectory();

        if (isDirectory) await recursiveSearchForImages(filePath);
      }),
    );
  };

  await recursiveSearchForImages(imagesBaseDirectory);

  return { imageFilesMetaData };
};
