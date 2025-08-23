import { existsSync, readFileSync, unlinkSync } from 'fs';

import { thrownExceptionToLoggerAsError } from '../utils/thrown-exception';

import { getParsedJsonByFilePath } from './get-parsed-json-by-file-path';

jest.mock('fs', () => {
  const mockExistsSync = jest.fn();
  const mockReadFileSync = jest.fn();
  const mockUnlinkSync = jest.fn();

  return {
    existsSync: mockExistsSync,
    readFileSync: mockReadFileSync,
    unlinkSync: mockUnlinkSync,
  };
});

jest.mock('../utils/thrown-exception', () => {
  const mockThrownExceptionToLoggerAsError = jest.fn();

  return {
    thrownExceptionToLoggerAsError: mockThrownExceptionToLoggerAsError,
  };
});

// Get references to the mocked functions
const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockReadFileSync = readFileSync as jest.MockedFunction<
  typeof readFileSync
>;
const mockUnlinkSync = unlinkSync as jest.MockedFunction<typeof unlinkSync>;
const mockThrownExceptionToLoggerAsError =
  thrownExceptionToLoggerAsError as jest.MockedFunction<
    typeof thrownExceptionToLoggerAsError
  >;

describe('getParsedJsonByFilePath', () => {
  it('will return the fallback if path from props is not valid', () => {
    mockExistsSync.mockReturnValueOnce(false);
    const testFallback = 'john doe';
    const testFilePath = './foo';

    expect(getParsedJsonByFilePath(testFilePath, testFallback)).toBe(
      testFallback,
    );
    expect(mockExistsSync).toHaveBeenCalledWith(testFilePath);
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

    expect(mockThrownExceptionToLoggerAsError).toHaveBeenCalledWith(
      new SyntaxError(
        `Unexpected token 'I', "I am not an object" is not valid JSON`,
      ),
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

    expect(mockUnlinkSync).toHaveBeenCalledWith(testPath);
  });
});
