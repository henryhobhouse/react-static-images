import path from 'path';

// eslint-disable-next-line import/no-unresolved
import type { Image } from 'mdast';

import {
  optimisedImagesPublicDirectoryRoot,
  originalImageDirectory,
} from '../constants';
import { logger } from '../logger';

import { getImageMetaDataByPath } from './get-image-meta-data-by-path';
import { jsxPropsToString } from './jsx-props-to-string';
import type { JsxNode } from './types';

export const hydrateMdImageProps = (filePath: string) => (node: Image) => {
  const fileDirectory = path.dirname(filePath);
  const imageMeta = getImageMetaDataByPath(node.url, fileDirectory);

  if (!imageMeta) {
    logger.error(
      `Cannot find processed image, within a markdown image tag, with path "${node.url}" from "${filePath}"`,
    );

    return;
  }

  const imagePublicUrl = `/${optimisedImagesPublicDirectoryRoot}/${originalImageDirectory}/${imageMeta.imageHash}${imageMeta.uniqueName}`;
  const imagePropsString = jsxPropsToString([
    ['alt', { type: 'Literal', value: node.alt as string | undefined }],
    ['title', { type: 'Literal', value: node.title as string | undefined }],
    ['src', { type: 'Literal', value: imagePublicUrl }],
    [
      'placeholderBase64',
      { type: 'Literal', value: imageMeta.placeholderBase64 },
    ],
    [
      'width',
      {
        type: 'LiteralExpression',
        value: imageMeta.width?.toString(),
      },
    ],
    [
      'height',
      {
        type: 'LiteralExpression',
        value: imageMeta.height?.toString(),
      },
    ],
  ]);

  (node as unknown as JsxNode).type = 'jsx';
  (node as unknown as JsxNode).value = `<img${imagePropsString}/>`;
};
