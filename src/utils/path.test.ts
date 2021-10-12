import { trimSeparators } from './path';

describe('path utils', () => {
  describe('trimSeparators', () => {
    it('will remove prefixed separators', () => {
      expect(trimSeparators('/foo/bar')).toBe('foo/bar');
    });

    it('will remove postfixed separators', () => {
      expect(trimSeparators('foo/bar/')).toBe('foo/bar');
    });

    it('will remove multiple prefixed separators', () => {
      expect(trimSeparators('///foo/bar')).toBe('foo/bar');
    });

    it('will remove multiple postfixed separators', () => {
      expect(trimSeparators('foo/bar///')).toBe('foo/bar');
    });

    it('will remove both postfixed, and prefixed, separators together', () => {
      expect(trimSeparators('//foo/bar//')).toBe('foo/bar');
    });
  });
});
