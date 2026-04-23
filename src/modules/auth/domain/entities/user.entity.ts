import { AuthProvider } from '../enums/providers.enum';
import { Roles } from '../enums/roles.enum';
import {
  AccountNotVerifiedError,
  InvalidCredentialsError,
  InvalidProviderError,
} from '../errors/auth.errors';
import { EmailVO } from '../value-objects/email.vo';
import { NameVO } from '../value-objects/name.vo';
import { BcryptHashVO } from '../value-objects/bcryptHash.vo';
import { uuidVO } from '../value-objects/uuidVO';
import { CreateUserData, UserBasic, UserRawData } from '../types/user';
import { PlainPasswordVO } from '../value-objects/plain-password';
import { UserCreatedEvent } from '../events/user-created.event';
import { UserOAuth } from '../types/auth';

export class UserEntity {
  private _domainEvents: object[] = [];

  private constructor(
    private readonly _id: uuidVO,
    private _name: NameVO,
    private _role: Roles,
    private readonly _provider: AuthProvider,
    private _isVerified: boolean,
    private _email: EmailVO,
    private _password: BcryptHashVO | PlainPasswordVO | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private readonly _providerId: string | null,
    private _resetToken: string | null,
    private _deletedAt: Date | null,
  ) {}

  // To crerate a new user applies business rules
  static create(data: CreateUserData): UserEntity {
    return new UserEntity(
      new uuidVO(data.id),
      new NameVO(data.name),
      Roles.MEMBER,
      data.provider,
      data.isVerified,
      new EmailVO(data.email),
      data.password ? PlainPasswordVO.create(data.password) : null,
      new Date(),
      new Date(),
      data.providerId ?? null,
      null,
      null,
    );
  }

  // To rehydrate from DB - without revalidating
  static fromPersistence(data: UserRawData): UserEntity {
    return new UserEntity(
      new uuidVO(data.id),
      new NameVO(data.name),
      data.role,
      data.provider,
      data.isVerified,
      new EmailVO(data.email),
      data.password ? BcryptHashVO.create(data.password) : null,
      data.createdAt,
      data.updatedAt,
      data.providerId ?? null,
      data.resetToken ?? null,
      data.deletedAt ?? null,
    );
  }

  // Domain methods
  ensureVerified(): void {
    if (!this._isVerified) throw new AccountNotVerifiedError();
  }

  validateLocalAuth(): void {
    if (this._provider !== AuthProvider.LOCAL) {
      throw new InvalidProviderError('Unauthorized');
    }
    if (!this.password) {
      throw new InvalidCredentialsError();
    }
  }

  changeEmail(newEmail: string): void {
    this._email = new EmailVO(newEmail);
    this._updatedAt = new Date();
  }

  changePassword(newPlainPassword: string): void {
    this._password = BcryptHashVO.create(newPlainPassword);
    this._updatedAt = new Date();
  }

  verify(): void {
    this._isVerified = true;
    this._updatedAt = new Date();
  }

  toBasic(): UserBasic {
    return { id: this.id, name: this.name, email: this.email, role: this.role };
  }

  clearEvents(): void {
    this._domainEvents = [];
  }
  set addDomainEvent(data: UserOAuth) {
    this._domainEvents.push(new UserCreatedEvent(data.id, data.name, data.avatarUrl ?? null));
  }
  get domainEvents(): object[] {
    return [...this._domainEvents];
  }
  get id(): string {
    return this._id.get();
  }
  get email(): string {
    return this._email.get();
  }
  get password(): string | null {
    return this._password?.get() ?? null;
  }
  get name(): string {
    return this._name.get();
  }
  get role(): Roles {
    return this._role;
  }
  get isVerified(): boolean {
    return this._isVerified;
  }
  get provider(): AuthProvider {
    return this._provider;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get providerId(): string | null {
    return this._providerId;
  }
  get resetToken(): string | null {
    return this._resetToken;
  }
  get deletedAt(): Date | null {
    return this._deletedAt;
  }
}
