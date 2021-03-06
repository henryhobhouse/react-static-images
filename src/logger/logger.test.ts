import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';

import { waitFor } from '../../test/utils/wait-for';

import { logger } from './logger';

const globalConsole = console;

const pathToErrorLogFile = path.resolve(
  process.cwd(),
  'static-image-error.log',
);

describe('logger', () => {
  const consoleLogMock = jest.fn();

  beforeAll(() => {
    // eslint-disable-next-line no-global-assign
    console = {
      log: consoleLogMock,
    } as never;
  });

  afterAll(() => {
    // eslint-disable-next-line no-global-assign
    console = globalConsole;
    waitFor(() => unlinkSync(pathToErrorLogFile));
  });

  beforeEach(jest.clearAllMocks);

  it('will log out standard messages with a blue info prefix', () => {
    const logMessage = 'hello world';
    logger.info(logMessage);
    expect(consoleLogMock).toBeCalledWith(expect.stringContaining(logMessage));
    expect(consoleLogMock).toBeCalledWith(
      expect.stringContaining('\u001B[34minfo'),
    );
  });

  it('will log out warning messages with a yellow warn prefix', () => {
    const logMessage = 'oh no a warning';
    logger.warn(logMessage);
    expect(consoleLogMock).toBeCalledWith(expect.stringContaining(logMessage));
    expect(consoleLogMock).toBeCalledWith(
      expect.stringContaining('\u001B[33mwarn'),
    );
  });

  it('will log out custom success messages with a green success prefix', () => {
    const logMessage = 'oh joy. It has worked...';
    logger.log('success', logMessage);
    expect(consoleLogMock).toBeCalledWith(expect.stringContaining(logMessage));
    expect(consoleLogMock).toBeCalledWith(
      expect.stringContaining('\u001B[32msuccess'),
    );
  });

  it('will log out error messages with a red error prefix', async () => {
    const logMessage = 'oh dear, we have failed...';
    logger.error(logMessage);
    expect(consoleLogMock).toBeCalledWith(expect.stringContaining(logMessage));
    expect(consoleLogMock).toBeCalledWith(
      expect.stringContaining('\u001B[31merror'),
    );
    // need to clear error from log file to not corrupt other tests
    await waitFor(() => writeFileSync(pathToErrorLogFile, ''));
  });

  it('will create an empty error log file on instantiation', async () => {
    await waitFor(() => {
      const fileExists = existsSync(pathToErrorLogFile);
      expect(fileExists).toBeTruthy();
    });

    const errorLogFileContent = readFileSync(pathToErrorLogFile).toString();
    expect(errorLogFileContent).toBe('');
  });

  it('will save log error to file', async () => {
    const errorMessage = 'foo screwed the bar';

    logger.error(errorMessage);

    await waitFor(() => {
      const errorLogFileContents = readFileSync(pathToErrorLogFile).toString();
      expect(errorLogFileContents).toContain(`error: ${errorMessage}`);
    });
  });

  it('will not save log error to file if requested', async () => {
    const errorMessage = 'foo screwed the bar';

    logger.log({ level: 'error', message: errorMessage, noFileSave: true });

    await waitFor(() => {
      const errorLogFileContents = readFileSync(pathToErrorLogFile).toString();
      expect(errorLogFileContents).toContain('');
    });
  });

  it('will not log to terminal stdout if requested', async () => {
    const errorMessage = 'foo screwed the bar';

    logger.log({ level: 'error', message: errorMessage, noConsole: true });
    logger.log({ level: 'info', message: 'blah blah blah', noConsole: true });
    logger.log({ level: 'warn', message: 'foo bar', noConsole: true });

    expect(consoleLogMock).not.toBeCalled();
  });
});
