import { IRefreshTokenRepository } from '../../../../../../../src/modules/identity/auth/domain/repositories/refreshToken.repository';

export class MockRefreshTokenRepository implements IRefreshTokenRepository {
  create = jest.fn();
  findByIdAndUserId = jest.fn();
  update = jest.fn();
  revoke = jest.fn();
}
