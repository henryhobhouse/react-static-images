/* eslint-disable object-shorthand */
/* eslint-disable no-useless-escape */
import { htmlPropsToString } from './html-props-to-string';

describe('htmlPropsToString', () => {
  it('will return a string with single space if not props passed', () => {
    expect(htmlPropsToString([])).toBe(' ');
  });

  it('will ignore any props that have an undefined value', () => {
    expect(htmlPropsToString([['foo', undefined]])).toBe(' ');
  });

  it('will ignore any props that have an null value', () => {
    // eslint-disable-next-line unicorn/no-null
    expect(htmlPropsToString([['foo', null]])).toBe(' ');
  });

  it('will ignore any props that have an empty string as a value', () => {
    expect(htmlPropsToString([['foo', { type: 'Literal', value: '' }]])).toBe(
      ' ',
    );
  });

  it('will add return a prop with string value with value wrapped in escaped double quotation marks', () => {
    // prettier-ignore
    expect(htmlPropsToString([['foo', { type: 'Literal', value: 'bar' }]])).toBe(' foo=\"bar\" ');
  });

  it('will add return a prop with non string value with value wrapped in curly brackets', () => {
    expect(
      htmlPropsToString([['foo', { type: 'LiteralExpression', value: '29' }]]),
    ).toBe(' foo={29} ');
  });

  it('will handle objects as values', () => {
    expect(
      htmlPropsToString([
        ['foo', { type: 'ObjectExpression', value: '{ baz: { a: [] } }' }],
      ]),
    ).toBe(' foo={{ baz: { a: [] } }} ');
  });

  it('will handle functions as values', () => {
    expect(
      htmlPropsToString([
        [
          'foo',
          { type: 'ArrowFunctionExpression', value: '() => { return {}; }' },
        ],
      ]),
    ).toBe(' foo={() => { return {}; }} ');
  });

  it('will handle arrays as values', () => {
    expect(
      htmlPropsToString([
        ['foo', { type: 'ArrayExpression', value: '["hi"]' }],
      ]),
    ).toBe(' foo={["hi"]} ');
  });

  it('will allow handle multiple props', () => {
    expect(
      htmlPropsToString([
        ['foo', { type: 'LiteralExpression', value: '0' }],
        ['bar', { type: 'LiteralExpression', value: 'false' }],
        ['baz', { type: 'ArrayExpression', value: '["hi"]' }],
        ['qwerty', { type: 'Literal', value: 'ping' }],
      ]),
    ).toBe(' foo={0} bar={false} baz={["hi"]} qwerty="ping" ');
  });
});
