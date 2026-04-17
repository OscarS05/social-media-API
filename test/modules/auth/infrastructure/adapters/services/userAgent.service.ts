import { UserAgentService } from '../../../../../../src/modules/auth/domain/services/userAgent.service';

export class MockUserAgentService extends UserAgentService {
  parse = jest.fn();
}
