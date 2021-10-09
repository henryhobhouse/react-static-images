import type { Node } from 'acorn';

export interface PropertyValue {
  type:
    | JsxExpressionType
    | 'ArrayExpression'
    | 'LiteralExpression'
    | 'ObjectExpression'
    | 'FunctionExpression'
    | 'ArrowFunctionExpression';
  value: string;
}

type JsxExpressionType =
  | 'JSXFragment'
  | 'JSXElement'
  | 'JSXAttribute'
  | 'JSXText'
  | 'Literal'
  | 'Identifier';

export type JsxAstProps = Record<string, PropertyValue>;

export interface SimpleJsxAst {
  type: string;
  props: JsxAstProps;
  children?: SimpleJsxAst[] | string;
}

export interface RootSimpleJsxAst extends SimpleJsxAst {
  isNonEmptyOpeningTag: boolean;
}

export interface JsxAstRoot {
  type: 'Program';
  sourceType: string;
  body: {
    type: 'ExpressionStatement';
    expression: JSXExpression;
  }[];
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
  type: JsxExpressionType;
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
