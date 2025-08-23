import type { Root, Image } from 'mdast';
import visit from 'unist-util-visit';
import type { VFile } from 'vfile';

import { hydrateJsxImageProps } from './hydrate-jsx-image-props';
import { hydrateMdImageProps } from './hydrate-md-image-props';
import type { JsxNode } from './types';

const hydrateImageProps = (tree: Root, file: VFile) => {
  // hydrate all JSX image tags with hydrated props from images meta-data and update source
  visit<JsxNode>(tree, 'jsx', hydrateJsxImageProps(file.history[0] ?? ''));

  // replace all markdown image nodes with JSX tags with hydrated props
  // NOTE: its important this is done after hydrating the original JSX tags so these are not re-processed
  visit<Image>(tree, 'image', hydrateMdImageProps(file.history[0] ?? ''));
};

export const mdxRemarkPlugin = () => hydrateImageProps;
