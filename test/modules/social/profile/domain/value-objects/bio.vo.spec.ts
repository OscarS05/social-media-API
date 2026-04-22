import { BioVO } from '../../../../../../src/modules/social/profile/domain/value-objects/bio.vo';
import { InvalidBioError } from '../../../../../../src/modules/social/profile/domain/errors/profile.errors';

describe('BioVO', () => {
  describe('create', () => {
    it('should create a valid bio', () => {
      const bioText = 'This is my bio';
      const bio = BioVO.create(bioText);

      expect(bio.get()).toBe(bioText);
    });

    it('should trim whitespace from input', () => {
      const bioText = '  This is my bio  ';
      const bio = BioVO.create(bioText);

      expect(bio.get()).toBe('This is my bio');
    });

    it('should trim whitespace and return null for empty string', () => {
      const bio = BioVO.create('   ');

      expect(bio.get()).toBeNull();
    });

    it('should return null for empty string', () => {
      const bio = BioVO.create('');

      expect(bio.get()).toBeNull();
    });

    it('should accept bio at maximum length', () => {
      const maxBio = 'a'.repeat(280);
      const bio = BioVO.create(maxBio);

      expect(bio.get()).toBe(maxBio);
      expect(bio.get()?.length).toBe(280);
    });

    it('should throw error when bio exceeds maximum length', () => {
      const toBigBio = 'a'.repeat(281);

      expect(() => BioVO.create(toBigBio)).toThrow(InvalidBioError);
    });

    it('should throw error when trimmed bio exceeds maximum length', () => {
      const toBigBio = '  ' + 'a'.repeat(281) + '  ';

      expect(() => BioVO.create(toBigBio)).toThrow(InvalidBioError);
    });

    it('should handle bio with special characters', () => {
      const bioWithSpecialChars = '¡Hola! 🚀 This is my bio @profile #development';
      const bio = BioVO.create(bioWithSpecialChars);

      expect(bio.get()).toBe(bioWithSpecialChars);
    });

    it('should handle bio with newlines', () => {
      const bioWithNewlines = 'Line 1\nLine 2\nLine 3';
      const bio = BioVO.create(bioWithNewlines);

      expect(bio.get()).toBe(bioWithNewlines);
    });
  });

  describe('get', () => {
    it('should return the bio value', () => {
      const bioText = 'My bio content';
      const bio = BioVO.create(bioText);

      expect(bio.get()).toBe(bioText);
    });

    it('should return null when bio is empty', () => {
      const bio = BioVO.create('');

      expect(bio.get()).toBeNull();
    });

    it('should return trimmed value', () => {
      const bioText = '  Trimmed bio  ';
      const bio = BioVO.create(bioText);

      expect(bio.get()).toBe('Trimmed bio');
    });
  });
});
