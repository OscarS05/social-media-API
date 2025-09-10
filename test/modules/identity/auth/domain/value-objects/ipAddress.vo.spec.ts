import { InvalidIPAddressError } from '../../../../../../src/modules/identity/auth/domain/errors/refreshToken.errors';
import { IPAddressVO } from '../../../../../../src/modules/identity/auth/domain/value-objects/ipAddress.vo';

describe('IPAddressVO test', () => {
  it('should throw an error because the IP address is empty', () => {
    const value = '';
    expect(() => new IPAddressVO(value).get()).toThrow(InvalidIPAddressError);
    expect(() => new IPAddressVO(value).get()).toThrow('IP address cannot be empty');
  });

  it('should throw an error because the IP address has an invalid format', () => {
    const value = '@ * !';
    expect(() => new IPAddressVO(value).get()).toThrow(InvalidIPAddressError);
    expect(() => new IPAddressVO(value).get()).toThrow('Invalid IP address format');
  });

  it('should throw an error because the IP address has an invalid length', () => {
    const value = '255.255.255.255.255.255.255.255.255.255.1';
    expect(() => new IPAddressVO(value).get()).toThrow(InvalidIPAddressError);
    expect(() => new IPAddressVO(value).get()).toThrow('IP address is too long');
  });

  it('should return a value successfully', () => {
    const value = `127.0.0.1`;
    expect(new IPAddressVO(value).get()).toBe(value);
  });
});
