import { IUserRepository } from 'src/modules/identity/users/domain/repositories/user.repository';

export class UserRepositoryMock implements IUserRepository {
  createUser = jest.fn();
}
