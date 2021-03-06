import path from 'path';

// eslint-disable-next-line import/order
import { testDirectoryPath } from '../../../test/constants';

const demoContentPath = 'demo-content-folder';
const demoContentDirectory = path.join(testDirectoryPath, demoContentPath);

const mockStaticConfigOptions = {
  applicationPublicDirectory: '',
  excludedDirectories: [],
  imageFormats: ['png'],
  staticImageMetaDirectory: 'baz',
  thumbnailSize: 34,
};
const mockConfig = jest.fn().mockReturnValue(mockStaticConfigOptions);
const mockValidateImageCached = jest.fn().mockReturnValue(false);
const currentCacheImageName = 'foo';
const currentCacheImageHash = 'bar';
const mockCurrentCache = {
  [currentCacheImageName]: {
    imageHash: currentCacheImageHash,
  },
};

import { imageFormat } from '../../static-image-config';

const firstChildDirectory = 'child_directory';
const secondChildDirectory = 'nested_child_directory';

const mockGetUniqueFileNameByPath = jest
  .fn()
  .mockImplementation((_, fileName: string) => {
    return `[hash]-${fileName}`;
  });

import { getImageFilesMetaData } from './get-image-files-meta-data';

jest.mock('../../static-image-config', () => {
  const staticImageConfigExports = jest.requireActual(
    '../../static-image-config',
  );

  return {
    ...staticImageConfigExports,
    getStaticImageConfig: mockConfig,
  };
});

jest.mock('./validate-image-cached', () => ({
  validateImageCached: mockValidateImageCached,
}));

jest.mock('../../constants', () => ({
  currentWorkingDirectory: process.cwd(),
  imagesBaseDirectory: demoContentDirectory,
}));

jest.mock('../../caching', () => ({
  localDeveloperImageCache: {
    saveCacheToFileSystem: jest.fn(),
  },
  processedImageMetaDataCache: {
    currentCache: mockCurrentCache,
  },
}));

jest.mock('../process-static-image-constants', () => ({
  baseExcludedDirectories: [],
}));

// have the mock simple prefix '[hash]-' before file name to easily identify and test if function has been run
jest.mock('../../utils/data-fingerprinting', () => ({
  createUniqueFileNameFromPath: mockGetUniqueFileNameByPath,
}));

describe('getImagesMetaData', () => {
  afterEach(jest.clearAllMocks);

  it('will retrieve all PNG images from chosen content directory', async () => {
    const pngFileName = 'django_in_park.png';
    const result = await getImageFilesMetaData();
    expect(mockGetUniqueFileNameByPath).toBeCalledTimes(1);
    expect(result.imageFilesMetaData).toEqual([
      {
        fileName: pngFileName,
        path: expect.stringContaining(
          path.join(demoContentDirectory, pngFileName),
        ),
        type: imageFormat.png,
        uniqueImageName: `[hash]-${pngFileName.replace(
          /.(png|jpg|avif|tiff|jpeg|webp)/i,
          '',
        )}`,
      },
    ]);
  });

  it('will retrieve all JPEG and JPG images from chosen content directory', async () => {
    const jpgFileNames = [
      'django.jpg',
      'django_puppy.JPEG',
      'django_partying.JPG',
    ];
    mockConfig.mockReturnValueOnce({
      ...mockStaticConfigOptions,
      imageFormats: [imageFormat.jpeg],
    });
    const result = await getImageFilesMetaData();
    expect(mockGetUniqueFileNameByPath).toHaveBeenCalledTimes(3);
    expect(result.imageFilesMetaData).toEqual(
      expect.arrayContaining([
        {
          fileName: jpgFileNames[0],
          path: expect.stringContaining(
            path.join(demoContentDirectory, jpgFileNames[0]),
          ),
          type: imageFormat.jpeg,
          uniqueImageName: `[hash]-${jpgFileNames[0].replace(
            /.(png|jpg|avif|tiff|jpeg|webp)/i,
            '',
          )}`,
        },
        {
          fileName: jpgFileNames[1],
          path: expect.stringContaining(
            path.join(
              demoContentDirectory,
              firstChildDirectory,
              jpgFileNames[1],
            ),
          ),
          type: imageFormat.jpeg,
          uniqueImageName: `[hash]-${jpgFileNames[1].replace(
            /.(png|jpg|avif|tiff|jpeg|webp)/i,
            '',
          )}`,
        },
        {
          fileName: jpgFileNames[2],
          path: expect.stringContaining(
            path.join(
              demoContentDirectory,
              firstChildDirectory,
              secondChildDirectory,
              jpgFileNames[2],
            ),
          ),
          type: imageFormat.jpeg,
          uniqueImageName: `[hash]-${jpgFileNames[2].replace(
            /.(png|jpg|avif|tiff|jpeg|webp)/i,
            '',
          )}`,
        },
      ]),
    );
  });

  it('will retrieve all TIFF images from chosen content directory', async () => {
    const tiffFileName = 'django-with-toy.tiff';
    mockConfig.mockReturnValueOnce({
      ...mockStaticConfigOptions,
      imageFormats: [imageFormat.tiff],
    });
    const result = await getImageFilesMetaData();
    expect(mockGetUniqueFileNameByPath).toBeCalledTimes(1);
    expect(result.imageFilesMetaData).toEqual([
      {
        fileName: tiffFileName,
        path: expect.stringContaining(
          path.join(
            demoContentDirectory,
            firstChildDirectory,
            secondChildDirectory,
            tiffFileName,
          ),
        ),
        type: imageFormat.tiff,
        uniqueImageName: `[hash]-${tiffFileName.replace(
          /.(png|jpg|avif|tiff|jpeg|webp)/i,
          '',
        )}`,
      },
    ]);
  });

  it('will retrieve all AVIF images from chosen content directory if added as accepted image format', async () => {
    const avifFileName = 'django_at_beach.avif';
    mockConfig.mockReturnValueOnce({
      ...mockStaticConfigOptions,
      imageFormats: [imageFormat.avif],
    });
    const result = await getImageFilesMetaData();
    expect(mockGetUniqueFileNameByPath).toBeCalledTimes(1);
    expect(result.imageFilesMetaData).toEqual([
      {
        fileName: avifFileName,
        path: expect.stringContaining(
          path.join(
            demoContentDirectory,
            firstChildDirectory,
            secondChildDirectory,
            avifFileName,
          ),
        ),
        type: imageFormat.avif,
        uniqueImageName: `[hash]-${avifFileName.replace(
          /.(png|jpg|avif|tiff|jpeg|webp)/i,
          '',
        )}`,
      },
    ]);
  });

  it('will retrieve all WEBP images from chosen content directory', async () => {
    const webpFileName = 'puppy_asleep_with_toy.webp';
    mockConfig.mockReturnValueOnce({
      ...mockStaticConfigOptions,
      imageFormats: [imageFormat.webp],
    });
    const result = await getImageFilesMetaData();
    expect(mockGetUniqueFileNameByPath).toBeCalledTimes(1);
    expect(result.imageFilesMetaData).toEqual([
      {
        fileName: webpFileName,
        path: expect.stringContaining(
          path.join(demoContentDirectory, firstChildDirectory, webpFileName),
        ),
        type: imageFormat.webp,
        uniqueImageName: `[hash]-${webpFileName.replace(
          /.(png|jpg|avif|tiff|jpeg|webp)/i,
          '',
        )}`,
      },
    ]);
  });

  it('will retrieve multiple file image meta data types from chosen content directory', async () => {
    mockConfig.mockReturnValueOnce({
      ...mockStaticConfigOptions,
      imageFormats: [
        imageFormat.webp,
        imageFormat.jpeg,
        imageFormat.png,
        imageFormat.avif,
        imageFormat.tiff,
      ],
    });
    const result = await getImageFilesMetaData();
    expect(mockGetUniqueFileNameByPath).toBeCalledTimes(7);
    expect(result.imageFilesMetaData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fileName: expect.stringContaining('.'),
          path: expect.stringContaining(demoContentDirectory),
          type: expect.stringContaining(''),
          uniqueImageName: expect.stringContaining('[hash]-'),
        }),
      ]),
    );
  });

  it('will retrieve multiple file image meta data types from different content directory', async () => {
    const nestedDirectoryImageFileNames = [
      'django-with-toy.tiff',
      'django_partying.JPG',
      'django_at_beach.avif',
    ];
    jest.mock('../../constants', () => ({
      currentWorkingDirectory: process.cwd(),
      imagesBaseDirectory: path.join(
        demoContentDirectory,
        firstChildDirectory,
        secondChildDirectory,
      ),
    }));
    mockConfig.mockReturnValueOnce({
      ...mockStaticConfigOptions,
      imageFormats: [
        imageFormat.webp,
        imageFormat.jpeg,
        imageFormat.png,
        imageFormat.avif,
        imageFormat.tiff,
      ],
    });
    jest.resetModules();
    const { getImageFilesMetaData: getImageFilesMetaDataTemporary } =
      await import('./get-image-files-meta-data');

    const result = await getImageFilesMetaDataTemporary();
    expect(mockGetUniqueFileNameByPath).toBeCalledTimes(3);
    expect(result.imageFilesMetaData).toEqual(
      expect.arrayContaining([
        {
          fileName: nestedDirectoryImageFileNames[2],
          path: expect.stringContaining(
            path.join(
              demoContentDirectory,
              firstChildDirectory,
              secondChildDirectory,
              nestedDirectoryImageFileNames[2],
            ),
          ),
          type: imageFormat.avif,
          uniqueImageName: `[hash]-${nestedDirectoryImageFileNames[2].replace(
            /.(png|jpg|avif|tiff|jpeg|webp)/i,
            '',
          )}`,
        },
        {
          fileName: nestedDirectoryImageFileNames[0],
          path: expect.stringContaining(
            path.join(
              demoContentDirectory,
              firstChildDirectory,
              secondChildDirectory,
              nestedDirectoryImageFileNames[0],
            ),
          ),
          type: imageFormat.tiff,
          uniqueImageName: `[hash]-${nestedDirectoryImageFileNames[0].replace(
            /.(png|jpg|avif|tiff|jpeg|webp)/i,
            '',
          )}`,
        },
        {
          fileName: nestedDirectoryImageFileNames[1],
          path: expect.stringContaining(
            path.join(
              demoContentDirectory,
              firstChildDirectory,
              secondChildDirectory,
              nestedDirectoryImageFileNames[1],
            ),
          ),
          type: imageFormat.jpeg,
          uniqueImageName: `[hash]-${nestedDirectoryImageFileNames[1].replace(
            /.(png|jpg|avif|tiff|jpeg|webp)/i,
            '',
          )}`,
        },
      ]),
    );
  });

  it('will gracefully handle if no images found in chosen directory', async () => {
    mockConfig.mockReturnValueOnce({
      ...mockStaticConfigOptions,
      imageFormats: [
        imageFormat.webp,
        imageFormat.jpeg,
        imageFormat.png,
        imageFormat.avif,
        imageFormat.tiff,
      ],
    });
    jest.mock('../../constants', () => ({
      currentWorkingDirectory: process.cwd(),
      imagesBaseDirectory: path.join(
        demoContentDirectory,
        'no_image_directory',
      ),
    }));
    jest.resetModules();
    const { getImageFilesMetaData: getImageFilesMetaDataTemporary } =
      await import('./get-image-files-meta-data');

    const result = await getImageFilesMetaDataTemporary();
    expect(mockGetUniqueFileNameByPath).toBeCalledTimes(0);
    expect(result.imageFilesMetaData).toEqual([]);
  });

  it('will throw and error if no image types are in the configuration', async () => {
    mockConfig.mockReturnValueOnce({
      ...mockStaticConfigOptions,
      imageFormats: [],
    });
    await getImageFilesMetaData()
      .then(() => {
        throw new Error('expected getImageMetaData to throw error');
      })
      .catch((exception) =>
        expect(exception.message).toBe(
          'There needs to be at least one accepted image format',
        ),
      );
  });

  it('will ignore the excluded directories as set in config to prevent optimising images within them', async () => {
    const jpgFileNameInRoot = 'django.jpg';
    mockConfig.mockReturnValueOnce({
      ...mockStaticConfigOptions,
      excludedDirectories: [
        path.join('test', demoContentPath, firstChildDirectory),
      ],
      imageFormats: [imageFormat.jpeg],
    });
    const result = await getImageFilesMetaData();
    expect(mockGetUniqueFileNameByPath).toBeCalledTimes(1);
    expect(result.imageFilesMetaData).toEqual([
      {
        fileName: jpgFileNameInRoot,
        path: expect.stringContaining(
          path.join(demoContentDirectory, jpgFileNameInRoot),
        ),
        type: imageFormat.jpeg,
        uniqueImageName: `[hash]-${jpgFileNameInRoot.replace(
          /.(png|jpg|avif|tiff|jpeg|webp)/i,
          '',
        )}`,
      },
    ]);
  });

  it('will not return any meta data if each image has valid cache', async () => {
    mockValidateImageCached.mockReturnValue(true);
    mockConfig.mockReturnValueOnce({
      ...mockStaticConfigOptions,
      imageFormats: [
        imageFormat.webp,
        imageFormat.jpeg,
        imageFormat.png,
        imageFormat.avif,
        imageFormat.tiff,
      ],
    });
    const { imageFilesMetaData } = await getImageFilesMetaData();
    expect(mockValidateImageCached).toBeCalledTimes(7);
    expect(mockValidateImageCached.mock.calls[0]).toEqual([
      path.join(demoContentDirectory, 'django.jpg'),
      '[hash]-django',
    ]);
    expect(imageFilesMetaData).toEqual([]);
  });

  it('will return how many images it has found and if not in cache when not present', async () => {
    mockValidateImageCached.mockReturnValue(false);
    mockConfig.mockReturnValueOnce({
      ...mockStaticConfigOptions,
      imageFormats: [
        imageFormat.webp,
        imageFormat.jpeg,
        imageFormat.png,
        imageFormat.avif,
        imageFormat.tiff,
      ],
    });
    const { totalImagesFound, totalImagesCached } =
      await getImageFilesMetaData();

    expect(totalImagesFound).toBe(7);
    expect(totalImagesCached).toBe(0);
  });

  it('will return how many images are in cache when present', async () => {
    mockValidateImageCached.mockReturnValue(true);
    mockConfig.mockReturnValueOnce({
      ...mockStaticConfigOptions,
      imageFormats: [
        imageFormat.webp,
        imageFormat.jpeg,
        imageFormat.png,
        imageFormat.avif,
        imageFormat.tiff,
      ],
    });
    const { totalImagesFound, totalImagesCached } =
      await getImageFilesMetaData();

    expect(totalImagesFound).toBe(7);
    expect(totalImagesCached).toBe(7);
  });

  it('will return array of any cache that is now invalid', async () => {
    mockConfig.mockReturnValueOnce({
      ...mockStaticConfigOptions,
      imageFormats: [
        imageFormat.webp,
        imageFormat.jpeg,
        imageFormat.png,
        imageFormat.avif,
        imageFormat.tiff,
      ],
    });
    const { invalidCachedImages } = await getImageFilesMetaData();

    expect(invalidCachedImages).toEqual([
      { hash: currentCacheImageHash, name: currentCacheImageName },
    ]);
  });
});
