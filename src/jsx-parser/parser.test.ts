import { jsxToSimpleAst } from './parser';

const testJsxComponentName = 'qwerty';

describe('jsxToSimpleAst', () => {
  it('converts a simple self closing JSX component to simple AST', () => {
    expect(jsxToSimpleAst(`<${testJsxComponentName} />`)).toStrictEqual({
      children: undefined,
      isNonEmptyOpeningTag: false,
      props: {},
      type: testJsxComponentName,
    });
  });

  it('converts a string to simple AST', () => {
    expect(jsxToSimpleAst(`qwerty`)).toStrictEqual({
      children: 'qwerty',
      isNonEmptyOpeningTag: false,
      props: {},
      type: 'Fragment',
    });
  });

  it("will parse a prop that's values type is Literal (string only) and identify its type", () => {
    expect(
      jsxToSimpleAst(`<${testJsxComponentName} foo="bar" />`),
    ).toStrictEqual({
      children: undefined,
      isNonEmptyOpeningTag: false,
      props: {
        foo: {
          type: 'Literal',
          value: 'bar',
        },
      },
      type: testJsxComponentName,
    });
  });

  it("will parse a prop that's values type is Literal (string only), that is wrapped in curly brackets, and identify its type", () => {
    expect(
      jsxToSimpleAst(`<${testJsxComponentName} foo={"bar"} />`),
    ).toStrictEqual({
      children: undefined,
      isNonEmptyOpeningTag: false,
      props: {
        foo: {
          type: 'LiteralExpression',
          value: 'bar',
        },
      },
      type: testJsxComponentName,
    });
  });

  it("will parse a prop that's value is primitive, non string, type and identify it as primitive", () => {
    expect(
      jsxToSimpleAst(`<${testJsxComponentName} foo={1} baz={true} />`),
    ).toStrictEqual({
      children: undefined,
      isNonEmptyOpeningTag: false,
      props: {
        baz: {
          type: 'LiteralExpression',
          value: true,
        },
        foo: {
          type: 'LiteralExpression',
          value: 1,
        },
      },
      type: testJsxComponentName,
    });
  });

  it("will parse, and serialise, a prop that's value is of an object type and identify it as type of object", () => {
    expect(
      jsxToSimpleAst(
        `<${testJsxComponentName} foo={{ bar: { baz: 1 }}} bing={['a', 3, { t: 4 }]} />`,
      ),
    ).toStrictEqual({
      children: undefined,
      isNonEmptyOpeningTag: false,
      props: {
        bing: {
          type: 'ArrayExpression',
          value: "[ 'a', 3, { t: 4 }]",
        },
        foo: {
          type: 'ObjectExpression',
          value: '{ bar: { baz: 1 } }',
        },
      },
      type: testJsxComponentName,
    });
  });

  it("will parse a prop that's value is of an object type, but a function, and identify as type of function", () => {
    expect(
      jsxToSimpleAst(
        `<${testJsxComponentName} foo={() => null} bing={function() { return { foo: bar } }} />`,
      ),
    ).toStrictEqual({
      children: undefined,
      isNonEmptyOpeningTag: false,
      props: {
        bing: {
          type: 'FunctionExpression',
          value: 'function () { return { foo: bar };}',
        },
        foo: {
          type: 'ArrowFunctionExpression',
          value: '() => null',
        },
      },
      type: testJsxComponentName,
    });
  });

  it("will parse a prop that's value is a reference identifier and identify it as an Identifier", () => {
    expect(
      jsxToSimpleAst(`<${testJsxComponentName} foo={reference} />`),
    ).toStrictEqual({
      children: undefined,
      isNonEmptyOpeningTag: false,
      props: {
        foo: {
          type: 'Identifier',
          value: 'reference',
        },
      },
      type: testJsxComponentName,
    });
  });

  it("will parse a prop that's value is a reference identifier and identify it as an Identifier", () => {
    expect(
      jsxToSimpleAst(`<${testJsxComponentName} foo={reference} />`),
    ).toStrictEqual({
      children: undefined,
      isNonEmptyOpeningTag: false,
      props: {
        foo: {
          type: 'Identifier',
          value: 'reference',
        },
      },
      type: testJsxComponentName,
    });
  });

  it('will parse a boolean prop that is just passed as a key', () => {
    expect(
      jsxToSimpleAst(`<${testJsxComponentName} iAmABooleanProp />`),
    ).toStrictEqual({
      children: undefined,
      isNonEmptyOpeningTag: false,
      props: {
        iAmABooleanProp: {
          type: 'LiteralExpression',
          value: true,
        },
      },
      type: testJsxComponentName,
    });
  });

  it('will handle if the component has text as children', () => {
    expect(
      jsxToSimpleAst(
        `<${testJsxComponentName}>Hello World</${testJsxComponentName}>`,
      ),
    ).toStrictEqual({
      children: [
        {
          children: 'Hello World',
          props: {},
          type: 'Fragment',
        },
      ],
      isNonEmptyOpeningTag: false,
      props: {},
      type: testJsxComponentName,
    });
  });

  it('will handle if the component has a single child components', () => {
    expect(
      jsxToSimpleAst(
        `<${testJsxComponentName}><div foo={'bar'} /></${testJsxComponentName}>`,
      ),
    ).toStrictEqual({
      children: [
        {
          children: undefined,
          props: {
            foo: {
              type: 'LiteralExpression',
              value: 'bar',
            },
          },
          type: 'div',
        },
      ],
      isNonEmptyOpeningTag: false,
      props: {},
      type: testJsxComponentName,
    });
  });

  it('will handle if the component has a multiple child components', () => {
    expect(
      jsxToSimpleAst(
        `<${testJsxComponentName}><><div foo={'bar'} /><Baz qwe="rty" /></></${testJsxComponentName}>`,
      ),
    ).toStrictEqual({
      children: [
        {
          children: [
            {
              children: undefined,
              props: {
                foo: {
                  type: 'LiteralExpression',
                  value: 'bar',
                },
              },
              type: 'div',
            },
            {
              children: undefined,
              props: {
                qwe: {
                  type: 'Literal',
                  value: 'rty',
                },
              },
              type: 'Baz',
            },
          ],
          props: {},
          type: 'Fragment',
        },
      ],
      isNonEmptyOpeningTag: false,
      props: {},
      type: testJsxComponentName,
    });
  });

  it('will gracefully handle a simple unclosed opening jsx tag and flag this with the isNonEmptyOpeningTag property', () => {
    expect(jsxToSimpleAst(`<${testJsxComponentName}>`)).toStrictEqual({
      children: undefined,
      isNonEmptyOpeningTag: true,
      props: {},
      type: 'qwerty',
    });
  });

  it('will gracefully handle a single unclosed opening jsx tag with props and flag this with the isNonEmptyOpeningTag property', () => {
    expect(
      jsxToSimpleAst(`<${testJsxComponentName} width={23}>`),
    ).toStrictEqual({
      children: undefined,
      isNonEmptyOpeningTag: true,
      props: {
        width: {
          type: 'LiteralExpression',
          value: 23,
        },
      },
      type: 'qwerty',
    });
  });

  it('will throw an error on invalid jsx, other than having an unclosed opening jsx tag', () => {
    expect(() => jsxToSimpleAst(`<${testJsxComponentName}>>`)).toThrowError(
      'Could not parse "<qwerty>/>": Unexpected token `>`. Did you mean `&gt;` or `{">"}`? (1:9)',
    );
  });

  it('will throw and error on unclosed jsx tag with children', () => {
    expect(() =>
      jsxToSimpleAst(`<${testJsxComponentName} width={23}><div />`),
    ).toThrowError(
      'Could not parse "<qwerty width={23}><div />": Unexpected token (1:26)',
    );
  });
});
