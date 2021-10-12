// eslint-disable-next-line import/no-unresolved
import type { Literal } from 'mdast';

export interface JsxNode extends Literal {
  type: 'jsx' | 'html';
}
