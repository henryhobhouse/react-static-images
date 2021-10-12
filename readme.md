# React Static Images

Ultra fast image processing for fast loading and scalable React Applications

NOTE: Work in progress!

TODO:

- Cache Invalidation
- Webpack Loader to update image props in JSX at build time
- MDX plugin to update MAST at build time (for MDX webpack loader only)
- Manual publish to NPM
- Add versioning (likely via lerna)
- Update github actions config to auto publish on merge to main branch
- Documentation (readme/wikis)
- Consideration of runtime updates (no need to eject webpack config in CRA).
  This would require adding image meta data to global scope so would have to be
  an non default option as this isn't ideal if there are significant number of
  images.
- full integration tests (if practically feasible)
- examples in readme (post NPM publish) for both Next and CRA

DONE:

- Custom configurations via 'static-image.config.js' file. Includes parameters
  for:

```
  /* options of 'jpeg', 'png', 'webp', 'tiff' and 'avif' (default all other than 'avif') */
  imageFormats: ImageFormat[];
  /* width of placeholder thumbnail (before its stretched to fit size of image) in px whilst retaining ratio of original image (default 20(px) */
  thumbnailSize: number;
  /* additional images of size (width in px) created if smaller than original for the browser to use in smaller viewports (default [640, 750, 828, 1080, 1200, 1920, 2048, 3840]) */
  optimisedImageSizes: number[];
  /* use the lowest number of colours needed to achieve given quality (default 100) */
  optimisedImageColourQuality: number;
  /* zlib compression level, 0-9 (default 9) */
  optimisedImageCompressionLevel: number;
  /* location of directory to recursively search for images to be optimised. (default current working directory) */
  imagesBaseDirectory: string;
  /* location of directory that allows public assets for your web app. ('/public') */
  applicationPublicDirectory: string;
  /* location of directory to data that might not be added directory to 'applicationPublicDirectory' like (base64) thumbnails or image meta data */
  staticImageMetaDirectory: string;
  /* any directories that should be ignored by the library when searching for images to process */
  excludedDirectories: string[];
```

- Added CLI for requesting image processing by user; including progress updates
- Verbose error handling (chained error message with VError) with errors logged
  to file for helpful debugging.
- Optional conversion of all 'png', 'jpeg', 'webp', 'tiff' and 'avif' file types
- Conversion includes creation of base64 thumbnail (that will eventually be
  included in the JS bundle for instant load) and optional file sizes as
  configured in the config file. Defaults to '[640, 750, 828, 1080, 1200, 1920,
  2048, 3840]'
- Creation of all images original layout data to ensure zero layout shift on
  page load
- Creation of unique image fingerprinting in optimised image filename to avoid:
  - image file name clashing (from different directories)
  - automatic browser cache invalidation on image content being edited (you can
    add maximum cache invalidation to image header in your static doc bucket)
- Double layer of caching for both local machine and persistent cache for CI

Side Note:

- Repo has full unit test coverage and manually tested on a repo with over 6000
  images with zero issues.
