import { InvalidExpiresAtError } from '../../../../../../src/modules/identity/auth/domain/errors/refreshToken.errors';
import { ExpiresAtVO } from '../../../../../../src/modules/identity/auth/domain/value-objects/expiresAt.vo';

describe('ExpiresAtVO test', () => {
  it('should throw an error because the expiresAt is empty', () => {
    const value = '';
    expect(() => new ExpiresAtVO(value).get()).toThrow(InvalidExpiresAtError);
    expect(() => new ExpiresAtVO(value).get()).toThrow('Expiration date cannot be null');
  });

  it('should throw an error because the expiresAt is not a date', () => {
    const value = 'SELECT * FROM auth;';
    expect(() => new ExpiresAtVO(value).get()).toThrow(InvalidExpiresAtError);
    expect(() => new ExpiresAtVO(value).get()).toThrow('Invalid expiration date');
  });

  it('should return a date from a string', () => {
    const value = '10/09/2025';
    expect(new ExpiresAtVO(value).get()).toBeInstanceOf(Date);
  });

  it('should throw an error because the expiresAt must be in the future', () => {
    const value = new Date();
    expect(() => new ExpiresAtVO(value).get()).toThrow(InvalidExpiresAtError);
    expect(() => new ExpiresAtVO(value).get()).toThrow(
      'Expiration date must be in the future',
    );
  });

  it('should throw an error because the expiresAt is too far in the future', () => {
    const date = new Date();
    date.setDate(new Date().getDate() + 31);
    expect(() => new ExpiresAtVO(date).get()).toThrow(InvalidExpiresAtError);
    expect(() => new ExpiresAtVO(date).get()).toThrow(
      'Expiration date is too far in the future',
    );
  });

  it('should return a value successfully', () => {
    const date = new Date();
    date.setDate(new Date().getDate() + 30);
    expect(new ExpiresAtVO(date).get()).toStrictEqual(date);
  });
});
