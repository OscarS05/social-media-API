import { InvalidHashError } from '../../../../../src/modules/auth/domain/errors/auth.errors';
import { BcryptHashVO } from '../../../../../src/modules/auth/domain/value-objects/bcryptHash.vo';

describe('BcryptHashVO', () => {
  const validHash = '$2b$10$NhWYk4wG.q2//UkuKEvqE.74C5fw/2Z9Xs0MOzmpCKv/P5d3UpYNu';
  const invalidHash = 'not-a-bcrypt-hash';
  const shortHash = '$2b$10$short';
  const badPrefixHash = '$3b$10$NhWYk4wG.q2//UkuKEvqE.74C5fw/2Z9Xs0MOzmpCKv/P5d3UpYNu';

  it('should create a BcryptHashVO with a valid bcrypt hash', () => {
    const vo = BcryptHashVO.create(validHash);

    expect(vo).toBeInstanceOf(BcryptHashVO);
    expect(vo.get()).toBe(validHash);
  });

  it('should throw InvalidHashError for an empty hash value', () => {
    expect(() => BcryptHashVO.create('')).toThrow(InvalidHashError);
  });

  it('should throw InvalidHashError for a non-bcrypt hash value', () => {
    expect(() => BcryptHashVO.create(invalidHash)).toThrow(InvalidHashError);
  });

  it('should throw InvalidHashError for a hash with invalid prefix', () => {
    expect(() => BcryptHashVO.create(badPrefixHash)).toThrow(InvalidHashError);
  });

  it('should throw InvalidHashError for a hash with invalid length', () => {
    expect(() => BcryptHashVO.create(shortHash)).toThrow(InvalidHashError);
  });
});
