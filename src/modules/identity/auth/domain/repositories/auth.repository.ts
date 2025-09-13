import { AuthEntity } from '../entities/auth.entity';
import { AuthProvider } from '../enums/providers.enum';

export interface IAuthRepository {
  findByProviderId(
    provider: AuthProvider,
    providerUserId: string,
  ): Promise<AuthEntity | null>;

  findByEmail(email: string): Promise<AuthEntity | null>;

  createAuth(authData: AuthEntity): Promise<AuthEntity>;
}
