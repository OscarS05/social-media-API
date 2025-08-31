import { ForbiddenException } from '@nestjs/common';
import { AuthProvider } from './providers.enum';

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
    public user?: object,
  ) {}

  ensureVerified() {
    if (!this.isVerified) {
      throw new ForbiddenException('Account not verified. Please verify your email.');
    }
  }

  ensureValidProvider() {
    if (this.provider !== AuthProvider.LOCAL && this.password !== null) {
      throw new Error('Non-local accounts cannot have a password.');
    }
  }
}
