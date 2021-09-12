import { SingleBar, Options } from 'cli-progress';
import colors from 'colors';

const defaultCliConfig = {
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  etaBuffer: 300,
  format: `|${colors.magenta(
    '{bar}',
  )}| {percentage}% || {value}/{total} Images processed || ETA: {eta}s`,
  hideCursor: true,
};

let instance: SingleBar;

export const cliProgressBar = {
  getInstance: () => {
    if (!instance) {
      throw new Error("CLI progress hasn't been instantiated yet");
    }

    return instance;
  },

  instantiateInstance: (options?: Options) => {
    if (instance) {
      throw new Error('CLI progress has already been instantiated');
    }

    instance = new SingleBar({
      ...defaultCliConfig,
      ...options,
    });

    return instance;
  },
};