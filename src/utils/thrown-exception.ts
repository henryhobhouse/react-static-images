import VError from 'verror';

import { logger } from '../logger';

/**
 * As thrown exceptions can be of type unknown this normalises the exception to rethrow as an (V)Error
 */
export const thrownExceptionToError = (
  exception: unknown,
  errorMessage: string,
) => {
  if (exception instanceof Error) {
    throw new VError(exception, errorMessage);
  }

  if (typeof exception === 'object') {
    throw new VError(
      `${errorMessage}. Exception not an error: ${JSON.stringify(exception)}`,
    );
  }

  throw new VError(
    `${errorMessage}. Exception not an error: ${String(exception)}`,
  );
};

export const thrownExceptionToLoggerAsError = (
  exception: unknown,
  errorMessage: string,
) => {
  if (exception instanceof Error) {
    logger.error(`${errorMessage}: ${exception.message}`);

    return;
  }

  if (typeof exception === 'object') {
    logger.error(
      `${errorMessage}. Exception not an error: ${JSON.stringify(exception)}`,
    );

    return;
  }

  logger.error(`${errorMessage}. Exception not an error: ${String(exception)}`);
};
