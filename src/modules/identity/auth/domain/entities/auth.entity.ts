import { AuthProvider } from '../enums/providers.enum';
import {
  AccountNotVerifiedError,
  EmailAlreadyInUseError,
  InvalidProviderError,
} from '../errors/errors';
import { AuthIdVO } from '../value-objects/authId.vo';
import { EmailVO } from '../value-objects/email.vo';
import { PasswordVO } from '../value-objects/password.vo';

export class AuthEntity {
  constructor(
    private id: string,
    private userId: string,
    public provider: AuthProvider,
    public isVerified: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    private email?: string | null,
    private password?: string | null,
    public providerUserId?: string | null,
    public resetToken?: string | null,
    public deletedAt?: Date | null,
    public user?: object | null,
  ) {
    this.id = new AuthIdVO(id).get();
    this.userId = new AuthIdVO(userId).get();
    this.email = email ? new EmailVO(email ?? '').get() : null;
    this.password = password ? new PasswordVO(password ?? '').isEncrypted() : null;
  }

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

  set setId(value: string) {
    this.id = new AuthIdVO(value).get();
  }

  set setUserId(value: string) {
    this.userId = new AuthIdVO(value).get();
  }

  set setEmail(value: string) {
    this.email = new EmailVO(value).get();
  }

  set setPass(value: string) {
    this.password = new PasswordVO(value).get();
  }

  set setPlainPass(value: string) {
    this.password = new PasswordVO(value).isValidPlainPass();
  }

  get getId(): string {
    return this.id;
  }

  get getUserId(): string {
    return this.userId;
  }

  get getEmail(): string | null {
    return this.email ?? null;
  }

  get getPassword(): string | null {
    return this.password ?? null;
  }
}
