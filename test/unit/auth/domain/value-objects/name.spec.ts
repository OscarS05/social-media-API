import { InvalidNameError } from '../../../../../src/modules/auth/domain/errors/user.errors';
import { NameVO } from '../../../../../src/modules/auth/domain/value-objects/name.vo';

describe('NameVO', () => {
  it('should create a NameVO with a valid name', () => {
    const value = 'Test Admin';
    const vo = new NameVO(value);

    expect(vo).toBeInstanceOf(NameVO);
    expect(vo.get()).toBe(value);
  });

  it('should trim whitespace and collapse multiple spaces', () => {
    const vo = new NameVO('  Test   Admin  ');

    expect(vo.get()).toBe('Test Admin');
  });

  it('should allow accented names and punctuation', () => {
    const vo = new NameVO("Anne-Marie O'Connor");

    expect(vo.get()).toBe("Anne-Marie O'Connor");
  });

  it('should throw InvalidNameError for a name that is too short', () => {
    expect(() => new NameVO('A')).toThrow(InvalidNameError);
  });

  it('should throw InvalidNameError for a name that is too long', () => {
    expect(() => new NameVO('a'.repeat(51))).toThrow(InvalidNameError);
  });

  it('should throw InvalidNameError for a name with invalid characters', () => {
    expect(() => new NameVO('John3 Doe')).toThrow(InvalidNameError);
  });

  it('should throw InvalidNameError for a name starting with a hyphen', () => {
    expect(() => new NameVO('-John Doe')).toThrow(InvalidNameError);
  });

  it('should throw InvalidNameError for a name ending with a hyphen', () => {
    expect(() => new NameVO('John Doe-')).toThrow(InvalidNameError);
  });
});
