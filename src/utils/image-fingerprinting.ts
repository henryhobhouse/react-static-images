import shortHash from 'shorthash2';

/**
 * To avoid collisions with files with the same name in different directories we take a simple
 * hash of the path as a prefix to ensure a unique name when copied to the web app public directory.
 */
export const getUniqueFileNameByPath = (
  imagePath: string,
  imageName: string,
) => {
  const pathHash = shortHash(imagePath);

  return `${pathHash}-${imageName}`;
};
