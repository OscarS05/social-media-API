import { IpAddressService } from '../../../../../../src/modules/auth/domain/services/ipAddress.service';

export class MockIpAddressService extends IpAddressService {
  getVersion = jest.fn();

  isValid = jest.fn();

  normalize = jest.fn();
}
