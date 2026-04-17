import { UserRepository } from '../../../../../../src/modules/auth/domain/repositories/user.repository';

export class UserRepositoryMock extends UserRepository {
  createUser = jest.fn();
  findByProviderId = jest.fn();
  findByEmail = jest.fn();
}
