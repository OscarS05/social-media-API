import { InvalidExpiresAtError } from '../../../../../src/modules/auth/domain/errors/session.errors';
import { ExpiresAtVO } from '../../../../../src/modules/auth/domain/value-objects/expiresAt.vo';

describe('ExpiresAtVO test', () => {
  it('should throw an error because the expiresAt is empty', () => {
    const value = '';
    expect(() => ExpiresAtVO.create(value).get()).toThrow(InvalidExpiresAtError);
    expect(() => ExpiresAtVO.create(value).get()).toThrow('Expiration date cannot be null');
  });

  it('should throw an error because the expiresAt is not a date', () => {
    const value = 'SELECT * FROM auth;';
    expect(() => ExpiresAtVO.create(value).get()).toThrow(InvalidExpiresAtError);
    expect(() => ExpiresAtVO.create(value).get()).toThrow('Invalid expiration date');
  });

  it('should return a date from a string', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const value = futureDate.toISOString();

    expect(ExpiresAtVO.create(value).get()).toBeInstanceOf(Date);
  });

  it('should throw an error because the expiresAt must be in the future', () => {
    const value = new Date();
    expect(() => ExpiresAtVO.create(value).get()).toThrow(InvalidExpiresAtError);
    expect(() => ExpiresAtVO.create(value).get()).toThrow(
      'Expiration date must be in the future',
    );
  });

  it('should throw an error because the expiresAt is too far in the future', () => {
    const date = new Date();
    date.setDate(new Date().getDate() + 31);
    expect(() => ExpiresAtVO.create(date).get()).toThrow(InvalidExpiresAtError);
    expect(() => ExpiresAtVO.create(date).get()).toThrow(
      'Expiration date is too far in the future',
    );
  });

  it('should return a value successfully', () => {
    const date = new Date();
    date.setDate(new Date().getDate() + 30);
    expect(ExpiresAtVO.create(date).get()).toStrictEqual(date);
  });
});
