import { TokenService } from '../../../../../../src/modules/auth/domain/services/token.service';

export class MockJwtService extends TokenService {
  accessToken = jest.fn();
  refreshToken = jest.fn();
  verifyAccessToken = jest.fn();
  verifyRefreshToken = jest.fn();
  getRefreshTokenExpiration = jest.fn();
}
