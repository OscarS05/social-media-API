import { UserEntity } from '../entities/user.entity';
import { AuthProvider } from '../enums/providers.enum';

export abstract class UserRepository {
  abstract findByProviderId(
    provider: AuthProvider,
    providerUserId: string,
  ): Promise<UserEntity | null>;

  abstract findByEmail(email: string): Promise<UserEntity | null>;

  abstract createUser(userData: UserEntity): Promise<UserEntity>;
}
