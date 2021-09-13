const mockProcessStaticImages = jest.fn();

import { cli } from './cli';

jest.mock('../process-static-images', () => ({
  processStaticImages: mockProcessStaticImages,
}));

describe('cli', () => {
  it('will call process static images', async () => {
    await cli();
    expect(mockProcessStaticImages).toBeCalledWith();
  });
});
