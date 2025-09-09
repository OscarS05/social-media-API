import { InvalidTokenError } from '../../../../../../src/modules/identity/auth/domain/errors/refreshToken.errors';
import { TokenHashedVO } from '../../../../../../src/modules/identity/auth/domain/value-objects/tokenHashed.vo';

describe('TokenHashedVO test', () => {
  it('shoud throw an error because the token is empty', () => {
    const value = '';
    expect(() => new TokenHashedVO(value).get()).toThrow(InvalidTokenError);
    expect(() => new TokenHashedVO(value).get()).toThrow('Token is empty');
  });

  it('shoud throw an error because the token is not a hash', () => {
    const value = 'a98sd7asd879n8hg';
    expect(() => new TokenHashedVO(value)).toThrow(InvalidTokenError);
    expect(() => new TokenHashedVO(value)).toThrow('Token is not a hash');
  });

  it('shoud throw an error because the token has not a valid length', () => {
    const value = '$2b$10$.MDC7tYeNM.ejPBaZX1T1uUnDw';
    expect(() => new TokenHashedVO(value).get()).toThrow(InvalidTokenError);
    expect(() => new TokenHashedVO(value).get()).toThrow('Token has an invalid length');
  });

  it('shoud return a value successfully', () => {
    const value = '$2b$10$.MDC7tYeNM.ejPBaZX1T1uUnDwkIK2x6K45uhD7GdpBXtAZYsrniO';
    expect(new TokenHashedVO(value).get()).toBe(value);
  });
});
