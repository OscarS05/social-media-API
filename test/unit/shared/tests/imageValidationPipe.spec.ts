import {
  BadRequestError,
  ImageValidationPipe,
} from '../../../../src/shared/services/pipes/imageValidation.pipe';

describe('ImageValidationPipe', () => {
  let pipe: ImageValidationPipe;

  beforeEach(() => {
    pipe = new ImageValidationPipe();
  });

  describe('.transform()', () => {
    it('should return undefined if no file is provided', () => {
      const result = pipe.transform(undefined);

      expect(result).toBeUndefined();
    });

    it('should return file if image is valid', () => {
      const file = {
        mimetype: 'image/png',
        size: 1024,
      } as Express.Multer.File;

      const result = pipe.transform(file);

      expect(result).toBe(file);
    });

    it('should throw if mimetype is invalid', () => {
      const file = {
        mimetype: 'application/pdf',
        size: 1024,
      } as Express.Multer.File;

      expect(() => pipe.transform(file)).toThrow(BadRequestError);

      expect(() => pipe.transform(file)).toThrow(
        'Invalid image type. Allowed: jpg, jpeg, png, webp',
      );
    });

    it('should throw if image exceeds max size', () => {
      const file = {
        mimetype: 'image/png',
        size: 31 * 1024 * 1024,
      } as Express.Multer.File;

      expect(() => pipe.transform(file)).toThrow(BadRequestError);

      expect(() => pipe.transform(file)).toThrow('Image size exceeds 30MB limit');
    });

    it('should allow image exactly at max limit', () => {
      const file = {
        mimetype: 'image/jpeg',
        size: 30 * 1024 * 1024,
      } as Express.Multer.File;

      const result = pipe.transform(file);

      expect(result).toBe(file);
    });
  });
});
