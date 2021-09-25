import crypto from 'crypto';
import { promises } from 'fs';

import shortHash from 'shorthash2';

/**
 * To avoid collisions with files with the same name in different directories we take a simple
 * hash of the path as a prefix to ensure a unique name when copied to the web app public directory.
 */
export const createUniqueFileNameFromPath = (
  imagePath: string,
  imageName: string,
) => {
  const pathHash = shortHash(imagePath);

  return `${pathHash}-${imageName}`;
};

/**
 * Create short hash that is file system friendly
 *
 * Done via using the fastest way to get a hash from data on node (https://medium.com/@chris_72272/what-is-the-fastest-node-js-hashing-algorithm-c15c1a0e164e)
 * then removing any characters that cannot be used in file names then returning the first seven characters
 * from resulting hash
 */
export const createShortHashFromString = (dataString: string) =>
  crypto
    .createHash('sha1')
    .update(dataString)
    .digest('base64')
    .replace(/[+/=]/gi, '')
    .slice(0, 7);

/**
 * Create short hash based on file content found by path.
 */
export const getFileContentShortHashByPath = async (filePath: string) => {
  const fileContentBuffer = await promises.readFile(filePath);
  const fileContent = fileContentBuffer.toString();
  const fileHash = createShortHashFromString(fileContent);

  return fileHash;
};
