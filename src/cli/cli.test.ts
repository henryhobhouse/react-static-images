import { clearFileSystemCache } from '../caching';
import { logger } from '../logger';
import { processStaticImages } from '../process-static-images';

import { cli } from './cli';

jest.mock('../process-static-images', () => {
  const mockProcessStaticImages = jest.fn();

  return {
    processStaticImages: mockProcessStaticImages,
  };
});

jest.mock('../caching', () => {
  const mockClearCache = jest.fn();

  return {
    clearFileSystemCache: mockClearCache,
  };
});

jest.mock('../logger', () => {
  const mockLogger = jest.fn();

  return {
    logger: {
      log: mockLogger,
    },
  };
});

const mockProcessStaticImages = processStaticImages as jest.MockedFunction<
  typeof processStaticImages
>;
const mockClearCache = clearFileSystemCache as jest.MockedFunction<
  typeof clearFileSystemCache
>;
const mockLogger = logger.log as jest.MockedFunction<typeof logger.log>;

describe('cli', () => {
  // @ts-expect-error mocking function
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

  it('will call process static images with no arguments', async () => {
    await cli([]);
    expect(mockProcessStaticImages).toHaveBeenCalledWith();
  });

  it('will call process static images if not arguments include clear cache', async () => {
    await cli(['--clear', '--cache']);
    expect(mockProcessStaticImages).toHaveBeenCalledWith();
  });

  it('will call clearCache if arguments include clear cache', async () => {
    await cli(['--clearCache']);
    expect(mockClearCache).toHaveBeenCalledWith();
  });

  it('will log success on cache being cleared if arguments include clear cache', async () => {
    await cli(['--clearCache']);
    expect(mockLogger).toHaveBeenCalledWith({
      level: 'success',
      message:
        'Cleared cache and previously optimised images for react-static-images',
    });
  });

  it('will not call process static images if arguments include clear cache', async () => {
    await cli(['--clearCache']);
    expect(mockExit).toHaveBeenCalledWith(0);
  });
});
