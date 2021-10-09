import { Parser } from 'acorn';
import jsx from 'acorn-jsx';

import { thrownExceptionToError } from '../utils/thrown-exception';

import { getSimpleJsxAstNode } from './get-simple-jsx-ast-node';
import type { JsxAstRoot, RootSimpleJsxAst } from './types';

/**
 * JSX to simple JSX AST
 *
 * Takes valid JSX component, including children, or alternatively just the opening tag of a JSX Component
 * and parses it to simple AST
 *
 * Returns a AST with properties extracted to simple key and value strings with meta data on type of value
 */
export const jsxToSimpleAst = (input: string): RootSimpleJsxAst => {
  try {
    // if input is only the opening tag of a JSX component only then update to make self closing
    // so that the acorn JSX parser doesn't thrown an error. Otherwise assume valid JSX.
    const matchedOpeningTags = input.match(/</g);
    let isNonEmptyOpeningTag = false;
    if (
      matchedOpeningTags &&
      matchedOpeningTags?.length === 1 &&
      !input.endsWith('/>')
    ) {
      input = input.replace(/>$/, '/>');
      isNonEmptyOpeningTag = true;
    }

    // if only one < then check if /> at end other add
    const parsedJsx = Parser.extend(jsx({ allowNamespaces: false })).parse(
      input,
      {
        ecmaVersion: 2020,
      },
    ) as unknown as JsxAstRoot;

    const rootNode = parsedJsx.body[0].expression;

    return {
      ...getSimpleJsxAstNode(rootNode),
      isNonEmptyOpeningTag,
    };
  } catch (exception) {
    return thrownExceptionToError(exception, `Could not parse "${input}"`);
  }
};
