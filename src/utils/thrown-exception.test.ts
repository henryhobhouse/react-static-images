jest.mock('../logger', () => {
  const mockLoggerError = jest.fn();

  return {
    logger: {
      error: mockLoggerError,
    },
  };
});

import {
  thrownExceptionToError,
  thrownExceptionToLoggerAsError,
} from './thrown-exception';

const { logger } = jest.requireMock('../logger');
const mockLoggerError = logger.error;

describe('thrown exception', () => {
  describe('thrownExceptionToError', () => {
    it('will parse an Error object gracefully if passed as exception', () => {
      const errorMessage = 'fooBar';
      const appendedErrorMessage = 'baz';
      const testExceptionFunction = () =>
        thrownExceptionToError(new Error(errorMessage), appendedErrorMessage);

      expect(testExceptionFunction).toThrow(
        `${appendedErrorMessage}: ${errorMessage}`,
      );
    });

    it('will parse an non Error object gracefully if passed as exception', () => {
      const errorMessage = 'fooBar';
      const appendedErrorMessage = 'baz';
      const testExceptionFunction = () =>
        thrownExceptionToError({ errorMessage }, appendedErrorMessage);

      expect(testExceptionFunction).toThrow(
        `${appendedErrorMessage}. Exception not an error: {"errorMessage":"${errorMessage}"}`,
      );
    });

    it('will parse an non Error simple type gracefully if passed as exception', () => {
      const errorMessage = 'fooBar';
      const appendedErrorMessage = 'baz';
      const testExceptionFunction = () =>
        thrownExceptionToError(errorMessage, appendedErrorMessage);

      expect(testExceptionFunction).toThrow(
        `${appendedErrorMessage}. Exception not an error: ${errorMessage}`,
      );
    });
  });

  describe('thrownExceptionToLogError', () => {
    it('will log an Error object gracefully if passed as exception', () => {
      const errorMessage = 'fooBar';
      const appendedErrorMessage = 'baz';
      thrownExceptionToLoggerAsError(
        new Error(errorMessage),
        appendedErrorMessage,
      );

      expect(mockLoggerError).toHaveBeenCalledWith(
        `${appendedErrorMessage}: ${errorMessage}`,
      );
    });

    it('will log an non Error object gracefully if passed as exception', () => {
      const errorMessage = 'fooBar';
      const appendedErrorMessage = 'baz';
      thrownExceptionToLoggerAsError({ errorMessage }, appendedErrorMessage);

      expect(mockLoggerError).toHaveBeenCalledWith(
        `${appendedErrorMessage}. Exception not an error: {"errorMessage":"${errorMessage}"}`,
      );
    });

    it('will log an non Error simple type gracefully if passed as exception', () => {
      const errorMessage = 'fooBar';
      const appendedErrorMessage = 'baz';
      thrownExceptionToLoggerAsError(errorMessage, appendedErrorMessage);

      expect(mockLoggerError).toHaveBeenCalledWith(
        `${appendedErrorMessage}. Exception not an error: ${errorMessage}`,
      );
    });
  });
});
