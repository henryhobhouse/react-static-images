import path from 'path';

import { imageFormat } from '../static-image-config/constants';

const demoContentPath = '/test/demo-content-folder';
const demoContentDirectory = path.join(process.cwd(), demoContentPath);
const mockConfig = jest.fn().mockReturnValue({
  imageFormats: [imageFormat.png],
  imagesBaseDirectory: demoContentDirectory,
});
const mockGetUniqueFileNameByPath = jest
  .fn()
  .mockImplementation((_, fileName: string) => {
    return `[hash]-${fileName}`;
  });

import { getImageMetaData } from './get-images-meta-data';

jest.mock('../static-image-config', () => ({
  getStaticImageConfig: mockConfig,
}));

jest.mock('../utils/image-fingerprinting', () => ({
  getUniqueFileNameByPath: mockGetUniqueFileNameByPath,
}));

const firstChildDirectory = 'child_directory';
const secondChildDirectory = 'nested_child_directory';

describe('getImagesMetaData', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('will retrieve all PNG images from chosen content directory', async () => {
    const pngFileName = 'django_in_park.png';
    const result = await getImageMetaData();
    expect(mockGetUniqueFileNameByPath).toBeCalledTimes(1);
    expect(result.imageFilesMetaData).toEqual([
      {
        fileName: pngFileName,
        path: expect.stringContaining(`${demoContentDirectory}/${pngFileName}`),
        type: imageFormat.png,
        uniqueImageFileName: `[hash]-${pngFileName}`,
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
      imageFormats: [imageFormat.jpeg],
      imagesBaseDirectory: demoContentDirectory,
    });
    const result = await getImageMetaData();
    expect(mockGetUniqueFileNameByPath).toHaveBeenCalledTimes(3);
    expect(result.imageFilesMetaData).toEqual(
      expect.arrayContaining([
        {
          fileName: jpgFileNames[0],
          path: expect.stringContaining(
            `${demoContentDirectory}/${jpgFileNames[0]}`,
          ),
          type: imageFormat.jpeg,
          uniqueImageFileName: `[hash]-${jpgFileNames[0]}`,
        },
        {
          fileName: jpgFileNames[1],
          path: expect.stringContaining(
            `${demoContentDirectory}/${firstChildDirectory}/${jpgFileNames[1]}`,
          ),
          type: imageFormat.jpeg,
          uniqueImageFileName: `[hash]-${jpgFileNames[1]}`,
        },
        {
          fileName: jpgFileNames[2],
          path: expect.stringContaining(
            `${demoContentDirectory}/${firstChildDirectory}/${secondChildDirectory}/${jpgFileNames[2]}`,
          ),
          type: imageFormat.jpeg,
          uniqueImageFileName: `[hash]-${jpgFileNames[2]}`,
        },
      ]),
    );
  });

  it('will retrieve all TIFF images from chosen content directory', async () => {
    const tiffFileName = 'django-with-toy.tiff';
    mockConfig.mockReturnValueOnce({
      imageFormats: [imageFormat.tiff],
      imagesBaseDirectory: demoContentDirectory,
    });
    const result = await getImageMetaData();
    expect(mockGetUniqueFileNameByPath).toBeCalledTimes(1);
    expect(result.imageFilesMetaData).toEqual([
      {
        fileName: tiffFileName,
        path: expect.stringContaining(
          `${demoContentDirectory}/${firstChildDirectory}/${secondChildDirectory}/${tiffFileName}`,
        ),
        type: imageFormat.tiff,
        uniqueImageFileName: `[hash]-${tiffFileName}`,
      },
    ]);
  });

  it('will retrieve all AVIF images from chosen content directory', async () => {
    const avifFileName = 'django_at_beach.avif';
    mockConfig.mockReturnValueOnce({
      imageFormats: [imageFormat.avif],
      imagesBaseDirectory: demoContentDirectory,
    });
    const result = await getImageMetaData();
    expect(mockGetUniqueFileNameByPath).toBeCalledTimes(1);
    expect(result.imageFilesMetaData).toEqual([
      {
        fileName: avifFileName,
        path: expect.stringContaining(
          `${demoContentDirectory}/${firstChildDirectory}/${secondChildDirectory}/${avifFileName}`,
        ),
        type: imageFormat.avif,
        uniqueImageFileName: `[hash]-${avifFileName}`,
      },
    ]);
  });

  it('will retrieve all WEBP images from chosen content directory', async () => {
    const webpFileName = 'puppy_asleep_with_toy.webp';
    mockConfig.mockReturnValueOnce({
      imageFormats: [imageFormat.webp],
      imagesBaseDirectory: demoContentDirectory,
    });
    const result = await getImageMetaData();
    expect(mockGetUniqueFileNameByPath).toBeCalledTimes(1);
    expect(result.imageFilesMetaData).toEqual([
      {
        fileName: webpFileName,
        path: expect.stringContaining(
          `${demoContentDirectory}/${firstChildDirectory}/${webpFileName}`,
        ),
        type: imageFormat.webp,
        uniqueImageFileName: `[hash]-${webpFileName}`,
      },
    ]);
  });

  it('will retrieve multiple file image meta data types from chosen content directory', async () => {
    mockConfig.mockReturnValueOnce({
      imageFormats: [
        imageFormat.webp,
        imageFormat.jpeg,
        imageFormat.png,
        imageFormat.avif,
        imageFormat.tiff,
      ],
      imagesBaseDirectory: demoContentDirectory,
    });
    const result = await getImageMetaData();
    expect(mockGetUniqueFileNameByPath).toBeCalledTimes(7);
    expect(result.imageFilesMetaData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fileName: expect.stringContaining('.'),
          path: expect.stringContaining(demoContentDirectory),
          type: expect.stringContaining(''),
          uniqueImageFileName: expect.stringContaining('[hash]-'),
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
    mockConfig.mockReturnValueOnce({
      imageFormats: [
        imageFormat.webp,
        imageFormat.jpeg,
        imageFormat.png,
        imageFormat.avif,
        imageFormat.tiff,
      ],
      imagesBaseDirectory: path.join(
        demoContentDirectory,
        `/${firstChildDirectory}/${secondChildDirectory}`,
      ),
    });
    const result = await getImageMetaData();
    expect(mockGetUniqueFileNameByPath).toBeCalledTimes(3);
    expect(result.imageFilesMetaData).toEqual(
      expect.arrayContaining([
        {
          fileName: nestedDirectoryImageFileNames[2],
          path: expect.stringContaining(
            `${demoContentDirectory}/${firstChildDirectory}/${secondChildDirectory}/${nestedDirectoryImageFileNames[2]}`,
          ),
          type: imageFormat.avif,
          uniqueImageFileName: `[hash]-${nestedDirectoryImageFileNames[2]}`,
        },
        {
          fileName: nestedDirectoryImageFileNames[0],
          path: expect.stringContaining(
            `${demoContentDirectory}/${firstChildDirectory}/${secondChildDirectory}/${nestedDirectoryImageFileNames[0]}`,
          ),
          type: imageFormat.tiff,
          uniqueImageFileName: `[hash]-${nestedDirectoryImageFileNames[0]}`,
        },
        {
          fileName: nestedDirectoryImageFileNames[1],
          path: expect.stringContaining(
            `${demoContentDirectory}/${firstChildDirectory}/${secondChildDirectory}/${nestedDirectoryImageFileNames[1]}`,
          ),
          type: imageFormat.jpeg,
          uniqueImageFileName: `[hash]-${nestedDirectoryImageFileNames[1]}`,
        },
      ]),
    );
  });

  it('will gracefully handle if no images found in chosen directory', async () => {
    mockConfig.mockReturnValueOnce({
      imageFormats: [
        imageFormat.webp,
        imageFormat.jpeg,
        imageFormat.png,
        imageFormat.avif,
        imageFormat.tiff,
      ],
      imagesBaseDirectory: path.join(
        demoContentDirectory,
        '/no_image_directory',
      ),
    });
    const result = await getImageMetaData();
    expect(mockGetUniqueFileNameByPath).toBeCalledTimes(0);
    expect(result.imageFilesMetaData).toEqual([]);
  });

  it('will throw and error if no image types are in the configuration', async () => {
    mockConfig.mockReturnValueOnce({
      imageFormats: [],
      imagesBaseDirectory: demoContentDirectory,
    });
    await getImageMetaData()
      .then(() => {
        throw new Error('expected getImageMetaData to throw error');
      })
      .catch((error) =>
        expect(error.message).toBe(
          'There needs to be at least one accepted image format',
        ),
      );
  });
});
