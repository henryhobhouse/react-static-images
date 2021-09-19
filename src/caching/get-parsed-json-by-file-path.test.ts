const mockExistsSync = jest.fn();
const mockReadFileSync = jest.fn();
const mockUnlinkSync = jest.fn();
const mockThrownExceptionToLoggerAsError = jest.fn();

import { getParsedJsonByFilePath } from './get-parsed-json-by-file-path';

jest.mock('fs', () => ({
  existsSync: mockExistsSync,
  readFileSync: mockReadFileSync,
  unlinkSync: mockUnlinkSync,
}));

jest.mock('../utils/thrown-exception', () => ({
  thrownExceptionToLoggerAsError: mockThrownExceptionToLoggerAsError,
}));

describe('getParsedJsonByFilePath', () => {
  it('will return the fallback if path from props is not valid', () => {
    mockExistsSync.mockReturnValueOnce(false);
    const testFallback = 'john doe';
    const testFilePath = './foo';

    expect(getParsedJsonByFilePath(testFilePath, testFallback)).toBe(
      testFallback,
    );
    expect(mockExistsSync).toBeCalledWith(testFilePath);
  });

  it('will parse contents from file path and return result', () => {
    const testFileContents = { foo: 'bar' };
    mockExistsSync.mockReturnValueOnce(true);
    mockReadFileSync.mockReturnValueOnce(
      Buffer.from(JSON.stringify(testFileContents)),
    );

    expect(getParsedJsonByFilePath('./foo', {})).toEqual(testFileContents);
  });

  it('will gracefully catch errors parsing contents, request to log them out, and return fallback', () => {
    const testFileContents = 'I am not an object';
    const testFallback = { test: 'fallback' };
    const testPath = './foo';
    mockExistsSync.mockReturnValueOnce(true);
    mockReadFileSync.mockReturnValueOnce(Buffer.from(testFileContents));

    expect(getParsedJsonByFilePath(testPath, testFallback)).toEqual(
      testFallback,
    );

    expect(mockThrownExceptionToLoggerAsError).toBeCalledWith(
      new SyntaxError('Unexpected token I in JSON at position 0'),
      `Unable to retrieve and parse data from "${testPath}". Removing as likely corrupted`,
    );
  });

  it('will attempt to remove cache file if error parsing contents', () => {
    const testFileContents = 'I am not an object';
    const testFallback = { test: 'fallback' };
    const testPath = './foo';
    mockExistsSync.mockReturnValueOnce(true);
    mockReadFileSync.mockReturnValueOnce(Buffer.from(testFileContents));

    expect(getParsedJsonByFilePath(testPath, testFallback)).toEqual(
      testFallback,
    );

    expect(mockUnlinkSync).toBeCalledWith(testPath);
  });
});
