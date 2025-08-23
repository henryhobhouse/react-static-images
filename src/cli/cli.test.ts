const mockProcessStaticImages = jest.fn();
const mockClearCache = jest.fn();
const mockLogger = jest.fn();

import { cli } from './cli';

jest.mock('../process-static-images', () => ({
  processStaticImages: mockProcessStaticImages,
}));

jest.mock('../caching', () => ({
  clearFileSystemCache: mockClearCache,
}));

jest.mock('../logger', () => ({
  logger: {
    log: mockLogger,
  },
}));

describe('cli', () => {
  // @ts-expect-error mocking function
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
  afterEach(jest.clearAllMocks);

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
