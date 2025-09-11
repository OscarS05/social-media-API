import { IpAddressService } from '../../../../../../../src/modules/identity/auth/domain/services/ipAddress.service';

export class MockIpAddressService implements IpAddressService {
  getVersion = jest.fn();

  isValid = jest.fn();

  normalize = jest.fn();
}
