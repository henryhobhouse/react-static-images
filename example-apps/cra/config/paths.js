'use strict';

const fs = require('fs');
const path = require('path');

const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
const publicUrlOrPath = getPublicUrlOrPath(
  process.env.NODE_ENV === 'development',
  require(resolveApp('package.json')).homepage,
  process.env.PUBLIC_URL,
);

const buildPath = process.env.BUILD_PATH || 'build';

const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFunction, filePath) => {
  const extension = moduleFileExtensions.find((extension) =>
    fs.existsSync(resolveFunction(`${filePath}.${extension}`)),
  );

  if (extension) {
    return resolveFunction(`${filePath}.${extension}`);
  }

  return resolveFunction(`${filePath}.js`);
};

// config after eject: we're in ./config/
module.exports = {
  appBuild: resolveApp(buildPath),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveModule(resolveApp, 'src/index'),
  appJsConfig: resolveApp('jsconfig.json'),
  appNodeModules: resolveApp('node_modules'),
  appPackageJson: resolveApp('package.json'),
  appPath: resolveApp('.'),
  appPublic: resolveApp('public'),
  appSrc: resolveApp('src'),
  appTsBuildInfoFile: resolveApp('node_modules/.cache/tsconfig.tsbuildinfo'),
  appTsConfig: resolveApp('tsconfig.json'),
  appWebpackCache: resolveApp('node_modules/.cache'),
  dotenv: resolveApp('.env'),
  proxySetup: resolveApp('src/setupProxy.js'),
  publicUrlOrPath,
  swSrc: resolveModule(resolveApp, 'src/service-worker'),
  testsSetup: resolveModule(resolveApp, 'src/setupTests'),
  yarnLockFile: resolveApp('yarn.lock'),
};

module.exports.moduleFileExtensions = moduleFileExtensions;
