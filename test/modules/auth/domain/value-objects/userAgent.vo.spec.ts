import { InvalidUserAgentError } from '../../../../../src/modules/auth/domain/errors/session.errors';
import { UserAgentVO } from '../../../../../src/modules/auth/domain/value-objects/userAgent.vo';
import type { UserAgentParsed } from '../../../../../src/modules/auth/domain/services/userAgent.service';

describe('UserAgentVO', () => {
  const validAgent: UserAgentParsed = {
    browser: { name: 'Chrome', version: '140.0.0.0' },
    os: { name: 'Windows', version: '10' },
    device: { type: 'desktop', vendor: 'Apple', model: 'MacBook Pro' },
  };

  it('should create a UserAgentVO successfully', () => {
    const vo = UserAgentVO.create(validAgent);

    expect(vo.get()).toEqual(validAgent);
    expect(vo.getBrowserInfo()).toBe('Chrome 140.0.0.0');
    expect(vo.getOsInfo()).toBe('Windows 10');
    expect(vo.toDisplay()).toBe('Chrome 140.0.0.0 en Windows 10');
  });

  it('should create a UserAgentVO successfully when browser version is missing', () => {
    const agentWithoutBrowserVersion: UserAgentParsed = {
      browser: { name: 'Firefox' },
      os: { name: 'Linux', version: '5.15' },
      device: { type: 'desktop', vendor: 'Dell', model: 'XPS' },
    };

    const vo = UserAgentVO.create(agentWithoutBrowserVersion);

    expect(vo.getBrowserInfo()).toBe('Firefox');
    expect(vo.getOsInfo()).toBe('Linux 5.15');
  });

  it('should throw InvalidUserAgentError when the value is empty', () => {
    expect(() => UserAgentVO.create(undefined as unknown as UserAgentParsed)).toThrow(
      InvalidUserAgentError,
    );
    expect(() => UserAgentVO.create(undefined as unknown as UserAgentParsed)).toThrow(
      'UserAgent cannot be empty',
    );
  });

  it('should throw InvalidUserAgentError when browser name is missing', () => {
    const invalidAgent = {
      browser: { name: '' },
      os: { name: 'Windows', version: '10' },
      device: { type: 'desktop', vendor: 'Apple', model: 'MacBook Pro' },
    } as UserAgentParsed;

    expect(() => UserAgentVO.create(invalidAgent)).toThrow(InvalidUserAgentError);
    expect(() => UserAgentVO.create(invalidAgent)).toThrow('Browser name is required');
  });

  it('should throw InvalidUserAgentError when OS name is missing', () => {
    const invalidAgent = {
      browser: { name: 'Chrome', version: '140.0.0.0' },
      os: { name: '' },
      device: { type: 'desktop', vendor: 'Apple', model: 'MacBook Pro' },
    } as UserAgentParsed;

    expect(() => UserAgentVO.create(invalidAgent)).toThrow(InvalidUserAgentError);
    expect(() => UserAgentVO.create(invalidAgent)).toThrow('OS name is required');
  });
});
