import { IRefreshTokenRepository } from '../../../../../../../src/modules/identity/auth/domain/repositories/refreshToken.repository';

export class MockRefreshTokenRepository implements IRefreshTokenRepository {
  create = jest.fn();
}
