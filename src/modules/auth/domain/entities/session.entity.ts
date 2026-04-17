import { CreateSessionData, Session } from '../types/session';
import { RefreshTokenExpiredError, RefreshTokenRevokedError } from '../errors/session.errors';
import { uuidVO } from '../value-objects/uuidVO';
import { ExpiresAtVO } from '../value-objects/expiresAt.vo';
import { BcryptHashVO } from '../value-objects/bcryptHash.vo';
import { UserAgentVO } from '../value-objects/userAgent.vo';
import { UserAgentParsed } from '../services/userAgent.service';
import { InvalidTokenError } from '../errors/auth.errors';

export class SessionEntity {
  constructor(
    private readonly _id: uuidVO,
    private readonly _userId: uuidVO,
    private _tokenHashed: BcryptHashVO,
    private _version: number,
    private readonly _userAgent: UserAgentVO,
    private readonly _ipAddress: string,
    private _revoked: boolean,
    private _expiresAt: ExpiresAtVO,
    public readonly _createdAt: Date,
    public _updatedAt: Date,
  ) {}

  static create(data: CreateSessionData): SessionEntity {
    return new SessionEntity(
      new uuidVO(data.id),
      new uuidVO(data.userId),
      BcryptHashVO.create(data.tokenHashed),
      data.version,
      UserAgentVO.create(data.userAgent),
      data.ipAddress,
      false,
      ExpiresAtVO.create(data.expiresAt),
      new Date(),
      new Date(),
    );
  }

  static fromPersistence(data: Session): SessionEntity {
    return new SessionEntity(
      new uuidVO(data.id),
      new uuidVO(data.userId),
      BcryptHashVO.create(data.tokenHashed),
      data.version,
      UserAgentVO.create(data.userAgent),
      data.ipAddress,
      data.revoked,
      ExpiresAtVO.create(data.expiresAt),
      data.createdAt,
      data.updatedAt,
    );
  }

  isExpired(): void {
    if (Date.now() > this._expiresAt.get().getTime()) throw new RefreshTokenExpiredError();
  }

  isRevoked(): void {
    if (this._revoked) throw new RefreshTokenRevokedError();
  }

  isActive(): void {
    this.isRevoked();
    this.isExpired();
  }

  revoke(): void {
    if (!this._revoked) {
      this._revoked = true;
      this._updatedAt = new Date();
    }
  }

  rotateToken(newTokenHashed: string, newExpiredAt: Date, version: number) {
    this._tokenHashed = BcryptHashVO.create(newTokenHashed);
    this._expiresAt = ExpiresAtVO.create(newExpiredAt);
    this._revoked = false;
    this._updatedAt = new Date();
    this.version = version;
  }

  set version(newVersion: number) {
    if (newVersion < this._version) {
      throw new InvalidTokenError('Version cannot be decreased');
    }
    this._version = newVersion;
  }

  get id(): string {
    return this._id.get();
  }
  get userId(): string {
    return this._userId.get();
  }
  get tokenHashed(): string {
    return this._tokenHashed.get();
  }
  get version(): number {
    return this._version;
  }
  get userAgent(): UserAgentParsed {
    return this._userAgent.get();
  }
  get ipAddress(): string {
    return this._ipAddress;
  }
  get revoked(): boolean {
    return this._revoked;
  }
  get expiresAt(): Date {
    return this._expiresAt.get();
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
