import { IAuthRepository } from '../../../../../../../src/modules/identity/auth/domain/repositories/auth.repository';

export class IAuthRepositoryMock implements IAuthRepository {
  findByProviderId = jest.fn();
  findByEmail = jest.fn();
  createAuth = jest.fn();
}
