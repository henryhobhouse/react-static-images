import {
  createUniqueFileNameFromPath,
  getFileContentShortHashByPath,
} from './image-fingerprinting';

const mockFileBuffer = Buffer.from('foo bar');

jest.mock('fs', () => ({
  promises: {
    readFile: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockFileBuffer)),
  },
}));

describe('Image fingerprinting', () => {
  describe('getUniqueFileNameByPath', () => {
    it('will consistently create the same unique hash from file path and file name', () => {
      const testPath = '/foo/bar';
      const testFileName = 'baz-luhrmann.jpg';
      for (const _ of Array.from({ length: 20 })) {
        expect(createUniqueFileNameFromPath(testPath, testFileName)).toBe(
          `Zr2gHx-${testFileName}`,
        );
      }
    });

    it('will create a different hash with same file name but different path', () => {
      const testPath1 = '/foo/bar';
      const testPath2 = '/foo/burr';
      const testFileName = 'baz-luhrmann.jpg';

      const testPath1FileName = createUniqueFileNameFromPath(
        testPath1,
        testFileName,
      );
      const testPath2FileName = createUniqueFileNameFromPath(
        testPath2,
        testFileName,
      );
      expect(testPath1FileName).not.toBe(testPath2FileName);
    });

    it('will postfix the file name to the end of the unique filename separated from the has with a hyphen', () => {
      const testPath = '/foo/bar';
      const testFileName = 'baz-luhrmann.jpg';

      const testPath1Hash = createUniqueFileNameFromPath(
        testPath,
        testFileName,
      );
      expect(testPath1Hash.endsWith(`-${testFileName}`)).toBeTruthy();
    });
  });

  describe('getFileShortHash', () => {
    it('will consistently return a unique short hash based on file contents', async () => {
      for (const _ of Array.from({ length: 20 })) {
        const shortHash = await getFileContentShortHashByPath('');
        expect(shortHash).toBe('N3PeplF');
      }
    });
  });
});
