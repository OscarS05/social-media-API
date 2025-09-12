import { IJwtService } from '../../../../../../../src/modules/identity/auth/domain/services/jwt.service';

export class MockJwtService implements IJwtService {
  sign = jest.fn();
  verify = jest.fn();
}
