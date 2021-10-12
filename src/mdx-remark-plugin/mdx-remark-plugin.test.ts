const mockVisit = jest.fn();
const mockHydrateJsxCurriedReturn = jest.fn();
const mockHydrateJsxImageProps = jest
  .fn()
  .mockReturnValue(mockHydrateJsxCurriedReturn);
const mockHydrateMdImageCurriedReturn = jest.fn();
const mockHydrateMdImageProps = jest
  .fn()
  .mockReturnValue(mockHydrateMdImageCurriedReturn);

import { mdxRemarkPlugin } from './mdx-remark-plugin';

jest.mock('unist-util-visit', () => ({
  __esModule: true,
  default: mockVisit,
}));

jest.mock('./hydrate-jsx-image-props', () => ({
  hydrateJsxImageProps: mockHydrateJsxImageProps,
}));

jest.mock('./hydrate-md-image-props', () => ({
  hydrateMdImageProps: mockHydrateMdImageProps,
}));

describe('mdxRemarkPlugin', () => {
  afterEach(jest.clearAllMocks);

  it('it returns a curried function', () => {
    expect(typeof mdxRemarkPlugin()).toBe('function');
  });

  it('request to visit all JSX instances in the MDAST and request that props for images are hydrated', () => {
    const testMdast = { foo: 'bar' } as any;
    const mockFilePath = 'baz';
    mdxRemarkPlugin()(testMdast, { history: [mockFilePath] } as any);
    expect(mockHydrateMdImageProps).toBeCalledTimes(1);
    expect(mockHydrateMdImageProps).toBeCalledWith(mockFilePath);
    expect(mockVisit).toBeCalledWith(
      testMdast,
      'jsx',
      mockHydrateJsxCurriedReturn,
    );
  });

  it('request to visit all MD image instances in the MDAST and request that props for images are hydrated', () => {
    const testMdast = { foo: 'bar' } as any;
    const mockFilePath = 'baz';
    mdxRemarkPlugin()(testMdast, { history: [mockFilePath] } as any);
    expect(mockHydrateJsxImageProps).toBeCalledTimes(1);
    expect(mockHydrateJsxImageProps).toBeCalledWith(mockFilePath);
    expect(mockVisit).toBeCalledWith(
      testMdast,
      'image',
      mockHydrateMdImageCurriedReturn,
    );
  });
});
