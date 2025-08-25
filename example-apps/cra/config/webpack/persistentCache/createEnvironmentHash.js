'use strict';
const { createHash } = require('crypto');

module.exports = (environment) => {
  const hash = createHash('md5');
  hash.update(JSON.stringify(environment));

  return hash.digest('hex');
};
