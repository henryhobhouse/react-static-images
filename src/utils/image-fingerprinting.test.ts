import { getUniqueFileNameByPath } from './image-fingerprinting';

describe('Image fingerprinting', () => {
  describe('getUniqueFileNameByPath', () => {
    it('will consistently create the same unique hash from file path and file name', () => {
      const testPath = '/foo/bar';
      const testFileName = 'baz-luhrmann.jpg';
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const _ of Array.from({ length: 10 })) {
        expect(getUniqueFileNameByPath(testPath, testFileName)).toBe(
          `Zr2gHx-${testFileName}`,
        );
      }
    });

    it('will create a different hash with same file name but different path', () => {
      const testPath1 = '/foo/bar';
      const testPath2 = '/foo/burr';
      const testFileName = 'baz-luhrmann.jpg';

      const testPath1FileName = getUniqueFileNameByPath(
        testPath1,
        testFileName,
      );
      const testPath2FileName = getUniqueFileNameByPath(
        testPath2,
        testFileName,
      );
      expect(testPath1FileName).not.toBe(testPath2FileName);
    });

    it('will postfix the file name to the end of the unique filename separated from the has with a hyphen', () => {
      const testPath = '/foo/bar';
      const testFileName = 'baz-luhrmann.jpg';

      const testPath1Hash = getUniqueFileNameByPath(testPath, testFileName);
      expect(testPath1Hash.endsWith(`-${testFileName}`)).toBeTruthy();
    });
  });
});
