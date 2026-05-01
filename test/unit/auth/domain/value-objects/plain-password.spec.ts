import { InvalidPasswordError } from '../../../../../src/modules/auth/domain/errors/auth.errors';
import { PlainPasswordVO } from '../../../../../src/modules/auth/domain/value-objects/plain-password';

describe('PlainPasswordVO', () => {
  const validPassword = 'Password1!';
  const shortPassword = 'Pass1!';
  const longPassword = 'VeryLongPassword1234567890!@#$%^&*()_+';
  const missingUppercase = 'password1!';
  const missingNumber = 'Password!';
  const missingSpecialChar = 'Password1';
  const paddedPassword = '  Password1!  ';

  it('should create a PlainPasswordVO for a valid password', () => {
    const vo = PlainPasswordVO.create(validPassword);

    expect(vo).toBeInstanceOf(PlainPasswordVO);
    expect(vo.get()).toBe(validPassword);
  });

  it('should trim whitespace around the password value', () => {
    const vo = PlainPasswordVO.create(paddedPassword);

    expect(vo.get()).toBe(validPassword);
  });

  it('should throw InvalidPasswordError when the password is too short', () => {
    expect(() => PlainPasswordVO.create(shortPassword)).toThrow(InvalidPasswordError);
  });

  it('should throw InvalidPasswordError when the password is too long', () => {
    expect(() => PlainPasswordVO.create(longPassword)).toThrow(InvalidPasswordError);
  });

  it('should throw InvalidPasswordError when the password has no uppercase letter', () => {
    expect(() => PlainPasswordVO.create(missingUppercase)).toThrow(InvalidPasswordError);
  });

  it('should throw InvalidPasswordError when the password has no number', () => {
    expect(() => PlainPasswordVO.create(missingNumber)).toThrow(InvalidPasswordError);
  });

  it('should throw InvalidPasswordError when the password has no special character', () => {
    expect(() => PlainPasswordVO.create(missingSpecialChar)).toThrow(InvalidPasswordError);
  });
});
