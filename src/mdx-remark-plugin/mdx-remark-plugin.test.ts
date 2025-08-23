import { visit } from 'unist-util-visit';

import { hydrateJsxImageProps } from './hydrate-jsx-image-props';
import { hydrateMdImageProps } from './hydrate-md-image-props';
import { mdxRemarkPlugin } from './mdx-remark-plugin';

jest.mock('unist-util-visit', () => {
  const mockVisit = jest.fn();

  return {
    __esModule: true,
    visit: mockVisit,
  };
});

jest.mock('./hydrate-jsx-image-props', () => {
  const mockHydrateJsxImageProps = jest.fn(() => jest.fn());

  return {
    hydrateJsxImageProps: mockHydrateJsxImageProps,
  };
});

jest.mock('./hydrate-md-image-props', () => {
  const mockHydrateMdImageProps = jest.fn(() => jest.fn());

  return {
    hydrateMdImageProps: mockHydrateMdImageProps,
  };
});

// Get references to the mocked functions
const mockVisit = visit as jest.MockedFunction<typeof visit>;
const mockHydrateJsxImageProps = hydrateJsxImageProps as jest.MockedFunction<
  typeof hydrateJsxImageProps
>;
const mockHydrateMdImageProps = hydrateMdImageProps as jest.MockedFunction<
  typeof hydrateMdImageProps
>;

// Create test constants for the curried return functions
const mockHydrateJsxCurriedReturn = jest.fn();
const mockHydrateMdImageCurriedReturn = jest.fn();

describe('mdxRemarkPlugin', () => {
  beforeEach(() => {
    // Set up the mocks to return our test constants
    mockHydrateJsxImageProps.mockReturnValue(mockHydrateJsxCurriedReturn);
    mockHydrateMdImageProps.mockReturnValue(mockHydrateMdImageCurriedReturn);
  });

  it('it returns a curried function', () => {
    expect(typeof mdxRemarkPlugin()).toBe('function');
  });

  it('request to visit all JSX instances in the MDAST and request that props for images are hydrated', () => {
    const testMdast = { foo: 'bar' } as any;
    const mockFilePath = 'baz';
    mdxRemarkPlugin()(testMdast, { history: [mockFilePath] } as any);
    expect(mockHydrateMdImageProps).toHaveBeenCalledTimes(1);
    expect(mockHydrateMdImageProps).toHaveBeenCalledWith(mockFilePath);
    expect(mockVisit).toHaveBeenCalledWith(
      testMdast,
      'jsx',
      mockHydrateJsxCurriedReturn,
    );
  });

  it('request to visit all MD image instances in the MDAST and request that props for images are hydrated', () => {
    const testMdast = { foo: 'bar' } as any;
    const mockFilePath = 'baz';
    mdxRemarkPlugin()(testMdast, { history: [mockFilePath] } as any);
    expect(mockHydrateJsxImageProps).toHaveBeenCalledTimes(1);
    expect(mockHydrateJsxImageProps).toHaveBeenCalledWith(mockFilePath);
    expect(mockVisit).toHaveBeenCalledWith(
      testMdast,
      'image',
      mockHydrateMdImageCurriedReturn,
    );
  });
});
