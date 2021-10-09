import { generate } from 'escodegen';

import type { JSXExpression, PropertyValue, SimpleJsxAst } from './types';

const getChildAstNodes = (childNodes?: JSXExpression[]) =>
  childNodes && childNodes.length > 0
    ? childNodes.map((childNode) => getSimpleJsxAstNode(childNode))
    : undefined;

export const getSimpleJsxAstNode = (node: JSXExpression): SimpleJsxAst => {
  if (node.type === 'JSXFragment') {
    return {
      children: getChildAstNodes(node.children),
      props: {},
      type: 'Fragment',
    };
  }

  if (node.type === 'JSXElement') {
    const propsEntries = node.openingElement.attributes
      .map((attribute) => {
        if (attribute.type === 'JSXAttribute') {
          if (
            attribute.name.type === 'JSXIdentifier' &&
            attribute.value === null
          ) {
            return [
              attribute.name.name,
              {
                type: 'LiteralExpression',
                value: true,
              },
            ];
          }

          if (attribute.value?.type === 'Literal') {
            return [
              attribute.name.name,
              { type: attribute.value.type, value: attribute.value.value },
            ];
          }

          if (attribute.value?.expression?.type === 'Literal') {
            return [
              attribute.name.name,
              {
                type: 'LiteralExpression',
                value: attribute.value.expression.value,
              },
            ];
          }

          if (attribute.value?.expression?.type) {
            return [
              attribute.name.name,
              {
                type: attribute.value.expression?.type,
                value: generate(attribute.value.expression, {
                  format: { indent: { style: ' ' } },
                })
                  .toString()
                  .replace(/\r?\n|\r/gm, ''),
              },
            ];
          }

          return [
            attribute.name.name,
            { type: 'unknown', value: attribute.value?.expression?.value },
          ];
        }

        return false;
      })
      .filter(Boolean) as Array<[key: string, value: PropertyValue]>;

    return {
      children: getChildAstNodes(node.children),
      props: Object.fromEntries(propsEntries),
      type: node.openingElement.name.name,
    };
  }

  if (node.type === 'JSXText') {
    return {
      children: node.value,
      props: {},
      type: 'Fragment',
    };
  }

  // Unsupported type
  throw new SyntaxError(`${node.type} is not supported`);
};
