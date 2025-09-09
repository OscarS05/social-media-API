import { InvalidPasswordError } from '../../../../../../src/modules/identity/auth/domain/errors/auth.errors';
import { PasswordVO } from '../../../../../../src/modules/identity/auth/domain/value-objects/password.vo';

describe('PasswordVO', () => {
  const wrongEmptyPassword = '';
  const wrongPasswordDueShortLength = 'pass123';
  const wrongPasswordDueLongLength = 'passsssssssssssssssssssssssssssssssss';
  const wrongPasswordWithoutNumber = 'password@';
  const wrongPasswordWithotUpperCase = 'password@123';
  const wrongPasswordWithoutSpecialChar = 'Password123';
  const correctPassword = 'Password123@';
  const correctPasswordEncrypted =
    '$2b$10$Ns9jeLi2xmujXkZZve/Vr.afNH45b9cqQiI.EjSmEhbSXFljlc7qi';

  it('should not throw an error because the password is encrypted', () => {
    expect(new PasswordVO(correctPasswordEncrypted).isEncrypted()).toBe(
      correctPasswordEncrypted,
    );
  });

  it('should not throw an error because the password is not encrypted', () => {
    expect(() => new PasswordVO(correctPassword).isEncrypted()).toThrow(
      InvalidPasswordError,
    );
  });

  it('should throw an error because the password have not at', () => {
    expect(() => new PasswordVO(wrongEmptyPassword).isValidPlainPass()).toThrow(
      InvalidPasswordError,
    );
  });

  it('should throw an error because the id have not dot', () => {
    expect(() => new PasswordVO(wrongPasswordDueShortLength).isValidPlainPass()).toThrow(
      InvalidPasswordError,
    );
  });

  it('should throw an error because the password have not at and dot', () => {
    expect(() => new PasswordVO(wrongPasswordDueLongLength).isValidPlainPass()).toThrow(
      InvalidPasswordError,
    );
  });

  it('should throw an error because the password have not at and dot', () => {
    expect(() => new PasswordVO(wrongPasswordWithoutNumber).isValidPlainPass()).toThrow(
      InvalidPasswordError,
    );
  });

  it('should throw an error because the password have not at and dot', () => {
    expect(() => new PasswordVO(wrongPasswordWithotUpperCase).isValidPlainPass()).toThrow(
      InvalidPasswordError,
    );
  });

  it('should throw an error because the password have not at and dot', () => {
    expect(() =>
      new PasswordVO(wrongPasswordWithoutSpecialChar).isValidPlainPass(),
    ).toThrow(InvalidPasswordError);
  });

  it('should not throw an error because the password is correct', () => {
    expect(new PasswordVO(correctPassword).isValidPlainPass()).toBe(correctPassword);
  });
});
