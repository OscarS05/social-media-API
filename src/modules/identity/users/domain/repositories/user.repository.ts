import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  createUser(userData: UserEntity): Promise<UserEntity>;
}
