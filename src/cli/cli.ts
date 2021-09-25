import { clearCache } from '../caching';
import { logger } from '../logger';
import { processStaticImages } from '../process-static-images';

export const cli = async (arguments_: string[]) => {
  if (arguments_.includes('--clearCache')) {
    await clearCache();
    logger.log({
      level: 'success',
      message:
        'Cleared cache and previously optimised images for react-static-images',
    });
  } else {
    await processStaticImages();
  }
};
