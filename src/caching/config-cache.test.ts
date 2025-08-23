const mockGetStaticImageConfig = jest.fn();
const mockGetParsedJsonByFilePathCc = jest.fn();
const mockCreateShortHashFromString = jest.fn();
const mockWriteFileSyncCc = jest.fn();
const mockConfigCacheFilePath = 'baz';

jest.mock('../static-image-config', () => ({
  getStaticImageConfig: mockGetStaticImageConfig,
}));

jest.mock('../utils/get-parsed-json-by-file-path', () => ({
  getParsedJsonByFilePath: mockGetParsedJsonByFilePathCc,
}));

jest.mock('./caching-constants', () => ({
  configCacheFilePath: mockConfigCacheFilePath,
}));

jest.mock('../utils/data-fingerprinting', () => ({
  createShortHashFromString: mockCreateShortHashFromString,
}));

jest.mock('fs', () => ({
  writeFileSync: mockWriteFileSyncCc,
}));

const mockConfig = { foo: 'bar' };

describe('Config cache', () => {
  afterEach(() => {
    jest.resetModules();
  });

  describe('isCurrentConfigMatchingCache', () => {
    it('will return false when no config cache is found', async () => {
      mockGetParsedJsonByFilePathCc.mockReturnValueOnce({});
      const { isCurrentConfigMatchingCache } = await import('./config-cache');
      expect(isCurrentConfigMatchingCache()).toBeFalsy();
      expect(mockCreateShortHashFromString).not.toHaveBeenCalled();
    });

    it('will return false when config cache hash does not match current config hash', async () => {
      mockGetParsedJsonByFilePathCc.mockReturnValueOnce({
        previousConfigHash: 'qwerty',
      });
      mockCreateShortHashFromString.mockReturnValueOnce('bob');
      mockGetStaticImageConfig.mockReturnValueOnce(mockConfig);
      const { isCurrentConfigMatchingCache } = await import('./config-cache');
      expect(isCurrentConfigMatchingCache()).toBeFalsy();
      expect(mockCreateShortHashFromString).toHaveBeenCalledWith(
        JSON.stringify(mockConfig),
      );
    });

    it('will return true when config cache hash matches current config hash', async () => {
      const testHash = 'qwerty';
      mockGetParsedJsonByFilePathCc.mockReturnValueOnce({
        previousConfigHash: testHash,
      });
      mockCreateShortHashFromString.mockReturnValueOnce(testHash);
      mockGetStaticImageConfig.mockReturnValueOnce(mockConfig);
      const { isCurrentConfigMatchingCache } = await import('./config-cache');
      expect(isCurrentConfigMatchingCache()).toBeTruthy();
      expect(mockCreateShortHashFromString).toHaveBeenCalledWith(
        JSON.stringify(mockConfig),
      );
    });
  });

  describe('saveCurrentConfigToCache', () => {
    it('will write current config to the file system', async () => {
      const testHash = 'qwerty';
      mockGetStaticImageConfig.mockReturnValueOnce(mockConfig);
      mockCreateShortHashFromString.mockReturnValueOnce(testHash);
      const { saveCurrentConfigToCache } = await import('./config-cache');
      saveCurrentConfigToCache();
      expect(mockWriteFileSyncCc).toHaveBeenCalledWith(
        mockConfigCacheFilePath,
        JSON.stringify({ previousConfigHash: testHash }, undefined, 2),
      );
      expect(mockCreateShortHashFromString).toHaveBeenCalledWith(
        JSON.stringify(mockConfig),
      );
    });
  });
});
