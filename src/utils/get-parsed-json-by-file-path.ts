import { existsSync, readFileSync, unlinkSync } from 'fs';

import { thrownExceptionToLoggerAsError } from '../utils/thrown-exception';

export const getParsedJsonByFilePath = <T = unknown>(
  path: string,
  fallback?: T,
) => {
  if (existsSync(path)) {
    try {
      const fileContentString = readFileSync(path).toString();

      return JSON.parse(fileContentString) as T;
    } catch (exception) {
      thrownExceptionToLoggerAsError(
        exception,
        `Unable to retrieve and parse data from "${path}". Removing as likely corrupted`,
      );
      unlinkSync(path);
    }
  }

  return fallback as T;
};
