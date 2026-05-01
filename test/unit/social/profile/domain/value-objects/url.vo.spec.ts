import { UrlVO } from '../../../../../../src/modules/social/profile/domain/value-objects/url.vo';
import { InvalidUrlError } from '../../../../../../src/modules/social/profile/domain/errors/profile.errors';

describe('UrlVO', () => {
  describe('create', () => {
    it('should create a valid HTTPS URL', () => {
      const url = UrlVO.create('https://example.com');
      expect(url.get()).toBe('https://example.com/');
    });

    it('should trim whitespace from URL', () => {
      const url = UrlVO.create('  https://example.com  ');
      expect(url.get()).toBe('https://example.com/');
    });

    it('should accept valid HTTPS URLs with path', () => {
      const url = UrlVO.create('https://example.com/path/to/page');
      expect(url.get()).toBe('https://example.com/path/to/page');
    });

    it('should accept valid HTTPS URLs with query parameters', () => {
      const url = UrlVO.create('https://example.com?param=value');
      expect(url.get()).toContain('https://example.com');
      expect(url.get()).toContain('param=value');
    });

    it('should accept valid HTTPS URLs with port', () => {
      const url = UrlVO.create('https://example.com:8443');
      expect(url.get()).toBe('https://example.com:8443/');
    });

    it('should throw error for HTTP protocol', () => {
      expect(() => UrlVO.create('http://example.com')).toThrow(InvalidUrlError);
      expect(() => UrlVO.create('http://example.com')).toThrow('Invalid protocol');
    });

    it('should throw error for invalid protocol', () => {
      expect(() => UrlVO.create('ftp://example.com')).toThrow(InvalidUrlError);
      expect(() => UrlVO.create('ftp://example.com')).toThrow('Invalid protocol');
    });

    it('should throw error for missing hostname', () => {
      expect(() => UrlVO.create('https://')).toThrow(InvalidUrlError);
    });

    it('should throw error for invalid URL format', () => {
      expect(() => UrlVO.create('not a url')).toThrow(InvalidUrlError);
    });

    it('should throw error for empty string', () => {
      expect(() => UrlVO.create('')).toThrow(InvalidUrlError);
    });

    it('should throw error for only whitespace', () => {
      expect(() => UrlVO.create('   ')).toThrow(InvalidUrlError);
    });
  });

  describe('get', () => {
    it('should return the URL as string', () => {
      const urlString = 'https://example.com/path';
      const url = UrlVO.create(urlString);
      expect(url.get()).toBe('https://example.com/path');
      expect(typeof url.get()).toBe('string');
    });
  });
});
