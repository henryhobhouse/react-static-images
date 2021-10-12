const mockAbsolutePathPrefix = '/qwerty/baz';

import path from 'path';

import {
  createUniqueFileNameFromPath,
  getFileContentShortHashByPath,
  createShortHashFromString,
} from './data-fingerprinting';

const mockFileBuffer = Buffer.from('foo bar');

jest.mock('fs', () => ({
  promises: {
    readFile: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockFileBuffer)),
  },
}));

jest.mock('../constants', () => ({
  currentWorkingDirectory: mockAbsolutePathPrefix,
}));

describe('Image fingerprinting', () => {
  describe('getUniqueFileNameByPath', () => {
    it('will consistently create the same unique hash from file path and file name', () => {
      const testPath = `${mockAbsolutePathPrefix}/foo/bar`;
      const testFileName = 'baz-luhrmann.jpg';
      for (const _ of Array.from({ length: 20 })) {
        expect(createUniqueFileNameFromPath(testPath, testFileName)).toBe(
          `ZwjfjQ-${testFileName}`,
        );
      }
    });

    it('will handle if image path is in a parent of the current working directory', () => {
      const testPath = path.join(mockAbsolutePathPrefix, '..', 'foo/bar');
      const testFileName = 'baz-luhrmann.jpg';

      expect(createUniqueFileNameFromPath(testPath, testFileName)).toBe(
        `Z23WOxv-${testFileName}`,
      );
    });

    it('will handle if image path is is prefixed with a path separator', () => {
      const testPath1 = path.join(mockAbsolutePathPrefix, 'foo/bar');
      const testPath2 = path.join(
        mockAbsolutePathPrefix.replace(/^\//, ''),
        'foo/bar',
      );
      const testFileName = 'baz-luhrmann.jpg';

      expect(createUniqueFileNameFromPath(testPath1, testFileName)).toBe(
        createUniqueFileNameFromPath(testPath2, testFileName),
      );
    });

    it('will handle if image path is is postfixed with a path separator', () => {
      const testPath1 = path.join(mockAbsolutePathPrefix, 'foo/bar');
      const testPath2 = path.join(mockAbsolutePathPrefix, 'foo/bar/');
      const testFileName = 'baz-luhrmann.jpg';

      expect(createUniqueFileNameFromPath(testPath1, testFileName)).toBe(
        createUniqueFileNameFromPath(testPath2, testFileName),
      );
    });

    it('will create a different hash with same file name but different path', () => {
      const testPath1 = `${mockAbsolutePathPrefix}/foo/bar`;
      const testPath2 = `${mockAbsolutePathPrefix}/foo/burr`;
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
      const testPath = `${mockAbsolutePathPrefix}/foo/bar`;
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

  describe('createShortHashFromString', () => {
    it('will consistently return the same hash for the same data string', () => {
      for (const _ of Array.from({ length: 100 })) {
        const shortHash = createShortHashFromString('foo/bar');
        expect(shortHash).toBe('F83q76X');
      }
    });

    it('will alway return a 7 character hash', () => {
      for (const index in Array.from({ length: 100 })) {
        const shortHash = createShortHashFromString(
          `${index.toString()}/foo/bar/${index.toString()}`,
        );
        expect(shortHash.length).toBe(7);
      }
    });

    it('will not include "+", "/" and "=" characters in the hash', () => {
      const testRegEx = new RegExp('[+/=]', 'g');
      for (const index in Array.from({ length: 100 })) {
        const shortHash = createShortHashFromString(
          `/foo/${index.toString()}/bar/${index.toString()}`,
        );
        expect(testRegEx.test(shortHash)).toBeFalsy();
      }
    });
  });
});
