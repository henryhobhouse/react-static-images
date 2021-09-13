#!/usr/bin/env node

require = require('esm')(module /*, options*/);

try {
  require('../cli').cli(process.argv);
} catch {
  // if using the library as a symlink or any way that isn't using it after a CI build
  // then to try to looking for the CLI module in the build directory instead
  require('../dist/cli').cli(process.argv);
}
