/* eslint-disable unicorn/no-process-exit */
import { clearFileSystemCache } from '../caching';
import { logger } from '../logger';
import { processStaticImages } from '../process-static-images';

export const cli = async (cliArguments: string[]) => {
  if (cliArguments.includes('--clearCache')) {
    await clearFileSystemCache();
    logger.log({
      level: 'success',
      message:
        'Cleared cache and previously optimised images for react-static-images',
    });
    // exit so clearing cache does not accidentally get used each time
    process.exit(0);
  }

  await processStaticImages();
};
