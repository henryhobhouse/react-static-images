import { validateUserConfig } from './config-validation';

describe('config validation', () => {
  it('will throw an error if config is null', () => {
    // eslint-disable-next-line unicorn/no-null
    expect(() => validateUserConfig(null)).toThrowError(
      'Your static-image.config.js config file is not exporting an object',
    );
  });

  it('will throw an error if config is a number', () => {
    expect(() => validateUserConfig(1)).toThrowError(
      'Your static-image.config.js config file is not exporting an object',
    );
  });

  it('will throw an error if config is a string', () => {
    expect(() => validateUserConfig('')).toThrowError(
      'Your static-image.config.js config file is not exporting an object',
    );
  });

  it('will throw an error if config is a array', () => {
    expect(() => validateUserConfig([])).toThrowError(
      'Your static-image.config.js config file is not exporting an object',
    );
  });

  it('will throw an error if config has a non-valid key', () => {
    const invalidKey = 'foo';
    expect(() => validateUserConfig({ [invalidKey]: 'bar' })).toThrowError(
      `You are using an invalid value in "${invalidKey}" in your static-image.config.js config file`,
    );
  });
});
