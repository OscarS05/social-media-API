import { UserAgentService } from '../../../../../../../src/modules/identity/auth/domain/services/userAgent.service';

export class MockUserAgentService implements UserAgentService {
  parse = jest.fn();
}
