/* eslint-disable unicorn/no-process-exit */
import { logger } from '../logger';

import { userConfigFileName } from './config-constants';
import { defaultConfig } from './default-config';

export const validateUserConfig = (userConfig: unknown) => {
  // check if config is an object
  if (
    typeof userConfig !== 'object' ||
    userConfig === null ||
    Array.isArray(userConfig)
  ) {
    logger.error(
      `Your ${userConfigFileName} config file is not exporting an object`,
    );
    process.exit(1);
  }

  // check that all keys are valid config values
  for (const key of Object.keys(userConfig)) {
    if (!Object.keys(defaultConfig).includes(key)) {
      logger.error(
        `You are using an invalid value in "${key}" in your ${userConfigFileName} config file. Please check the documentation.`,
      );
      process.exit(1);
    }
  }

  // TODO: to complete tests when library is near completed and config model is surer to be accurate.
};
