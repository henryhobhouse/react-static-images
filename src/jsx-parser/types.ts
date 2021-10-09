import type { Node } from 'acorn';

export interface PropertyValue {
  type: string;
  value: string;
}

export interface SimpleJsxAst {
  type: string;
  props: Record<string, PropertyValue>;
  children?: SimpleJsxAst[] | string;
}

export interface RootSimpleJsxAst extends SimpleJsxAst {
  isNonEmptyOpeningTag: boolean;
}

export interface JsxAstRoot extends JsxAstNode {
  type: 'Program';
  sourceType: string;
}

interface JsxAstNode extends Node {
  body?: JSXBody[];
}

interface JSXBody extends AttributeNode {
  type: 'ExpressionStatement';
}

interface AttributeNode extends JsxAstNode {
  type: string;
  expression?: JSXExpression;
  value?: string;
  raw?: string;
}

export interface JSXExpression extends JsxAstNode {
  type:
    | 'JSXFragment'
    | 'JSXElement'
    | 'JSXAttribute'
    | 'JSXText'
    | 'Literal'
    | 'Identifier';
  children?: JSXExpression[];
  openingElement: JsxAstNode & { attributes: JSXAttribute[]; name: JSXName };
  closingElement: JsxAstNode & { name: JSXName };
  value?: string;
  name?: string;
}

type JSXName = Node & { name: string };

interface JSXAttribute extends Node {
  name: JSXName;
  value: AttributeNode | null;
}
