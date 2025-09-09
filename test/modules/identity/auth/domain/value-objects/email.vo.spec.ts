import { InvalidEmailError } from '../../../../../../src/modules/identity/auth/domain/errors/auth.errors';
import { EmailVO } from '../../../../../../src/modules/identity/auth/domain/value-objects/email.vo';

describe('EmailVO', () => {
  const wrongEmailWithoutAt = 'emailtest.com';
  const wrongEmailWithoutDot = 'email@test';
  const wrongEmailByWithoutAtAndDot = 'emailtestcom';
  const wrongEmailDueIsEmpty = '';
  const correctEmail = 'email@test.com';

  it('should throw an error because the email have not at', () => {
    expect(() => new EmailVO(wrongEmailWithoutAt).get()).toThrow(InvalidEmailError);
  });

  it('should throw an error because the id have not dot', () => {
    expect(() => new EmailVO(wrongEmailWithoutDot).get()).toThrow(InvalidEmailError);
  });

  it('should throw an error because the email have not at and dot', () => {
    expect(() => new EmailVO(wrongEmailByWithoutAtAndDot).get()).toThrow(
      InvalidEmailError,
    );
  });

  it('should throw an error because the email is empty', () => {
    expect(() => new EmailVO(wrongEmailDueIsEmpty).get()).toThrow(InvalidEmailError);
  });

  it('should not throw an error because the email is correct', () => {
    expect(new EmailVO(correctEmail).get()).toBe(correctEmail);
  });
});
