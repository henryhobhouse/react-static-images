import type { Sharp } from 'sharp';

import { thrownExceptionToError } from '../../utils/thrown-exception';

interface Props {
  optimisedImageSize: number;
  pipeline: Sharp;
  optimisedImageCompressionLevel: number;
  optimisedImageColourQuality: number;
  imageSizeFilePath: string;
}

export const optimiseImageBySizePipeline = async ({
  pipeline,
  optimisedImageSize,
  optimisedImageCompressionLevel,
  optimisedImageColourQuality,
  imageSizeFilePath,
}: Props) => {
  try {
    const imageSizePipeline = pipeline
      .resize({ width: optimisedImageSize })
      .png({
        compressionLevel: optimisedImageCompressionLevel,
        quality: optimisedImageColourQuality,
      });

    await imageSizePipeline.toFile(imageSizeFilePath);
  } catch (exception) {
    thrownExceptionToError(
      exception,
      `Error processing image size '${optimisedImageSize}' pipeline`,
    );
  }
};
