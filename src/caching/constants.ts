import path from 'path';

import { getStaticImageConfig } from '../static-image-config';

const { staticImageMetaDirectory } = getStaticImageConfig();

export const imagesMetaDataFileName = 'image-meta-data.json';

export const processedImageMetaDataFilePath = path.join(
  process.cwd(),
  staticImageMetaDirectory,
  imagesMetaDataFileName,
);
