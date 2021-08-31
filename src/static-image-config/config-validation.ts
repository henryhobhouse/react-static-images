import { userConfigFileName } from './constants';
import { defaultConfig } from './default-config';

export const validateUserConfig = (userConfig: unknown) => {
  // check if config is an object
  if (
    typeof userConfig !== 'object' ||
    userConfig === null ||
    Array.isArray(userConfig)
  )
    throw new Error(
      `Your ${userConfigFileName} config file is not exporting an object`,
    );

  // check that all keys are valid config values
  for (const key of Object.keys(userConfig)) {
    if (!Object.keys(defaultConfig).includes(key))
      throw new Error(
        `You are using an invalid value in "${key}" in your ${userConfigFileName} config file`,
      );
  }

  // TODO: to complete tests when library is near completed and config model is surer to be accurate.
};
