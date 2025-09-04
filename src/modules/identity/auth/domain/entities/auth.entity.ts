import { AuthProvider } from './providers.enum';
import {
  AccountNotVerifiedError,
  EmailAlreadyInUseError,
  InvalidProviderError,
} from '../errors/errors';

export class AuthEntity {
  constructor(
    public id: string,
    public userId: string,
    public provider: AuthProvider,
    public isVerified: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public email?: string | null,
    public password?: string | null,
    public providerUserId?: string | null,
    public resetToken?: string | null,
    public deletedAt?: Date | null,
    public user?: object | null,
  ) {}

  ensureVerified(): void {
    if (!this.isVerified) throw new AccountNotVerifiedError();
  }

  ensureValidProvider(): void {
    if (this.provider !== AuthProvider.LOCAL && this.password !== null) {
      throw new InvalidProviderError();
    }
  }

  existsEmailToRegister(): void {
    if (this.email && !this.deletedAt) {
      throw new EmailAlreadyInUseError();
    }
  }
}
