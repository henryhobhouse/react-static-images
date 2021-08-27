import { existsSync, unlinkSync } from 'fs';

import { format, createLogger, transports, Logger } from 'winston';

const defaultErrorLogFileName = 'static-image-error.log';
const stringLineBreakRegex = /(\r\n|\n|\r)/gm;

/**
 * Slight adjustment from default NPM levels (https://github.com/winstonjs/winston#logging-levels)
 * Allow for "success" level
 */
const customLogLevels = {
  debug: 5,
  error: 0,
  info: 2,
  silly: 6,
  success: 3,
  verbose: 4,
  warn: 1,
};

const { timestamp, combine, printf, cli } = format;

/**
 * https://github.com/winstonjs/logform#cli
 */
const cliFormat = cli({
  colors: { info: 'blue', success: 'green', warn: 'yellow' },
  levels: customLogLevels,
});

// Do not log messages to console if they have { noConsole: true }
const noLogPrivateToConsole = format((info) => {
  if (info.noConsole) return false;

  return info;
});

// Do not save log messages to file if they have { noFileSave: true }
const noLogPrivateToFile = format((info) => {
  if (info.noFileSave) return false;

  return info;
});

let instance: Logger;

const getInstance = () => {
  if (!instance) {
    const errorLogFilePath = `${process.cwd()}/${defaultErrorLogFileName}`;

    // if there is a error log file, delete it, to ensure only new errors are saved.
    if (existsSync(errorLogFilePath)) {
      unlinkSync(errorLogFilePath);
    }

    instance = createLogger({
      level: 'success',
      levels: customLogLevels,
      transports: [
        new transports.Console({
          format: combine(noLogPrivateToConsole(), cliFormat),
        }),
        //
        // - Write all logs with level `error` to `errorLogFileName` prop or fallback
        //
        new transports.File({
          filename: defaultErrorLogFileName,
          format: combine(
            noLogPrivateToFile(),
            timestamp({
              format: 'DD-MM-YYYY HH:mm:ss',
            }),
            printf(
              (info) =>
                `${info.timestamp} ${info.level}: ${info.message.replace(
                  stringLineBreakRegex,
                  '',
                )}`,
            ),
          ),
          level: 'error',
        }),
      ],
    });
  }

  return instance;
};

const loggerSingleton = getInstance();

export const logger = loggerSingleton;
