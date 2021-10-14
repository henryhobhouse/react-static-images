import { promises } from 'fs';

import type { Sharp } from 'sharp';

import { thrownExceptionToError } from '../../utils/thrown-exception';

interface Props {
  pipeline: Sharp;
  imageCurrentFilePath: string;
  imagePublicFilePath: string;
  compressOriginalImage: boolean;
  optimisedImageCompressionLevel: number;
  optimisedImageColourQuality: number;
}

export const originalImagePipeline = async ({
  pipeline,
  imageCurrentFilePath,
  imagePublicFilePath,
  compressOriginalImage,
  optimisedImageCompressionLevel,
  optimisedImageColourQuality,
}: Props) => {
  try {
    if (compressOriginalImage) {
      const imageSizePipeline = pipeline.png({
        compressionLevel: optimisedImageCompressionLevel,
        quality: optimisedImageColourQuality,
      });

      await imageSizePipeline.toFile(imagePublicFilePath);
    } else {
      promises.copyFile(imageCurrentFilePath, imagePublicFilePath);
    }
  } catch (exception) {
    thrownExceptionToError(
      exception,
      `Error processing original image pipeline. Unable to ${
        compressOriginalImage ? 'convert and save image' : 'copy image'
      }`,
    );
  }
};
