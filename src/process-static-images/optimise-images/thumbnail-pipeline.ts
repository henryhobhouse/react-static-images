import { promises } from 'fs';

import { Sharp } from 'sharp';
import VError from 'verror';

interface Props {
  pipeline: Sharp;
  thumbnailFilePath: string;
  thumbnailSize: number;
}

export const thumbnailPipeline = async ({
  thumbnailFilePath,
  pipeline,
  thumbnailSize,
}: Props) => {
  try {
    const imageThumbnailBuffer = await pipeline
      .resize({ width: thumbnailSize })
      .png({
        compressionLevel: 9,
        quality: 5,
      })
      .toBuffer();
    const thumbnailBase64 = `data:image/png;base64,${imageThumbnailBuffer.toString(
      'base64',
    )}`;
    await promises.writeFile(thumbnailFilePath, thumbnailBase64);
  } catch (error) {
    const error_ =
      error instanceof Error
        ? new VError(error, `Error processing image thumbnail pipeline`)
        : new VError('Error processing image thumbnail pipeline');
    throw error_;
  }
};
