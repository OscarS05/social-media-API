import { InvalidUserAgentError } from '../../../../../../src/modules/identity/auth/domain/errors/refreshToken.errors';
import { UserAgentVO } from '../../../../../../src/modules/identity/auth/domain/value-objects/userAgent.vo';

describe('UserAgentVO test', () => {
  it('shoud throw an error because the userAgent is empty', () => {
    const value = '';
    expect(() => new UserAgentVO(value).get()).toThrow(InvalidUserAgentError);
    expect(() => new UserAgentVO(value).get()).toThrow('UserAgent cannot be empty');
  });

  it('shoud throw an error because the userAgent has an invalid character', () => {
    const value = '@ * !';
    expect(() => new UserAgentVO(value)).toThrow(InvalidUserAgentError);
    expect(() => new UserAgentVO(value)).toThrow('UserAgent contains invalid characters');
  });

  it('shoud throw an error because the userAgent has an invalid length', () => {
    const value =
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddaaaaaaaa';
    expect(() => new UserAgentVO(value).get()).toThrow(InvalidUserAgentError);
    expect(() => new UserAgentVO(value).get()).toThrow('UserAgent is too long');
  });

  it('shoud return a value successfully', () => {
    const value = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36`;
    expect(new UserAgentVO(value).get()).toBe(value);
  });
});
