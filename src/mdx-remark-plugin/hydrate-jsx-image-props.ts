import path from 'path';

import {
  optimisedImagesPublicDirectoryRoot,
  originalImageDirectory,
} from '../constants';
import type { JsxAstProps } from '../jsx-parser';
import { jsxToSimpleAst } from '../jsx-parser';
import { logger } from '../logger';
import { thrownExceptionToLoggerAsError } from '../utils/thrown-exception';

import { getImageMetaDataByPath } from './get-image-meta-data-by-path';
import { jsxPropsToString } from './jsx-props-to-string';
import type { JsxNode } from './types';

export const hydrateJsxImageProps = (filePath: string) => (node: JsxNode) => {
  const fileDirectory = path.dirname(filePath);

  try {
    const imageAst = jsxToSimpleAst(node.value);

    if (imageAst.type !== 'img' || !imageAst.props.src?.value) return;

    const imageMeta = getImageMetaDataByPath(
      imageAst.props.src?.value,
      fileDirectory,
    );

    if (!imageMeta) {
      logger.error(
        `Cannot find processed image, within a JSX tag, in path "${imageAst.props.src?.value}" from "${filePath}"`,
      );

      return;
    }

    const imagePublicUrl = `/${optimisedImagesPublicDirectoryRoot}/${originalImageDirectory}/${imageMeta.imageHash}${imageMeta.uniqueName}`;
    const imageProps: JsxAstProps = {
      ...imageAst.props,
      height: {
        type: 'LiteralExpression',
        value: imageMeta.height?.toString() ?? '',
      },
      placeholderBase64: {
        type: 'Literal',
        value: imageMeta.placeholderBase64,
      },
      src: {
        type: 'Literal',
        value: imagePublicUrl,
      },
      width: {
        type: 'LiteralExpression',
        value: imageMeta.width?.toString() ?? '',
      },
    };

    node.value = `<img${jsxPropsToString(Object.entries(imageProps))}/>`;
  } catch (exception) {
    thrownExceptionToLoggerAsError(
      exception,
      `Unable to hydrate properties for JSX tag "${node.value}" with path from "${filePath}"`,
    );
  }
};
