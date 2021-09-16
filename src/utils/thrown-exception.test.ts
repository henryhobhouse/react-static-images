const mockLoggerError = jest.fn();

import {
  thrownExceptionToError,
  thrownExceptionToLoggerAsError,
} from './thrown-exception';

jest.mock('../logger', () => ({
  logger: {
    error: mockLoggerError,
  },
}));

describe('thrown exception', () => {
  describe('thrownExceptionToError', () => {
    it('will parse an Error object gracefully if passed as exception', () => {
      const errorMessage = 'fooBar';
      const appendedErrorMessage = 'baz';
      const testExceptionFunction = () =>
        thrownExceptionToError(new Error(errorMessage), appendedErrorMessage);

      expect(testExceptionFunction).toThrowError(
        `${appendedErrorMessage}: ${errorMessage}`,
      );
    });

    it('will parse an non Error object gracefully if passed as exception', () => {
      const errorMessage = 'fooBar';
      const appendedErrorMessage = 'baz';
      const testExceptionFunction = () =>
        thrownExceptionToError({ errorMessage }, appendedErrorMessage);

      expect(testExceptionFunction).toThrowError(
        `${appendedErrorMessage}. Exception not an error: {"errorMessage":"${errorMessage}"}`,
      );
    });

    it('will parse an non Error simple type gracefully if passed as exception', () => {
      const errorMessage = 'fooBar';
      const appendedErrorMessage = 'baz';
      const testExceptionFunction = () =>
        thrownExceptionToError(errorMessage, appendedErrorMessage);

      expect(testExceptionFunction).toThrowError(
        `${appendedErrorMessage}. Exception not an error: ${errorMessage}`,
      );
    });
  });

  describe('thrownExceptionToLogError', () => {
    afterEach(jest.clearAllMocks);

    it('will log an Error object gracefully if passed as exception', () => {
      const errorMessage = 'fooBar';
      const appendedErrorMessage = 'baz';
      thrownExceptionToLoggerAsError(
        new Error(errorMessage),
        appendedErrorMessage,
      );

      expect(mockLoggerError).toBeCalledWith(
        `${appendedErrorMessage}: ${errorMessage}`,
      );
    });

    it('will log an non Error object gracefully if passed as exception', () => {
      const errorMessage = 'fooBar';
      const appendedErrorMessage = 'baz';
      thrownExceptionToLoggerAsError({ errorMessage }, appendedErrorMessage);

      expect(mockLoggerError).toBeCalledWith(
        `${appendedErrorMessage}. Exception not an error: {"errorMessage":"${errorMessage}"}`,
      );
    });

    it('will log an non Error simple type gracefully if passed as exception', () => {
      const errorMessage = 'fooBar';
      const appendedErrorMessage = 'baz';
      thrownExceptionToLoggerAsError(errorMessage, appendedErrorMessage);

      expect(mockLoggerError).toBeCalledWith(
        `${appendedErrorMessage}. Exception not an error: ${errorMessage}`,
      );
    });
  });
});
