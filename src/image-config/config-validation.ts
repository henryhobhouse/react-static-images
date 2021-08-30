import { defaultImageConfig } from './default-config';
import { userConfigFileName } from './image-config';

export const validateUserConfig = (userConfig: Record<string, unknown>) => {
  // check if config is an object
  if (typeof userConfig !== 'object')
    throw new Error(
      `Your ${userConfigFileName} config file is not exporting an object`,
    );

  // check that all keys are valid config values
  for (const key of Object.keys(userConfig)) {
    if (Object.keys(defaultImageConfig).includes(key))
      throw new Error(
        `You are using an invalid value in "${key}" in your ${userConfigFileName} config file`,
      );
  }

  // TODO: to complete when library is near completed and config model is surer to be accurate.
};
