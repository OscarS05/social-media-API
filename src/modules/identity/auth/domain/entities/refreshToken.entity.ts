import {
  RefreshTokenExpiredError,
  RefreshTokenRevokedError,
} from '../errors/refreshToken.errors';
import { AuthIdVO } from '../value-objects/authId.vo';
import { ExpiresAtVO } from '../value-objects/expiresAt.vo';
import { IPAddressVO } from '../value-objects/ipAddress.vo';
import { TokenHashedVO } from '../value-objects/tokenHashed.vo';
import { UserAgentVO } from '../value-objects/userAgent.vo';

export class RefreshTokenEntity {
  constructor(
    private readonly id: string,
    private readonly userId: string,
    private tokenHashed: string,
    private readonly userAgent: string,
    private readonly ipAddress: string,
    private revoked: boolean,
    private expiresAt: Date,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    this.id = new AuthIdVO(id).get();
    this.userId = new AuthIdVO(userId).get();
    this.tokenHashed = new TokenHashedVO(tokenHashed).get();
    this.userAgent = new UserAgentVO(userAgent).get();
    this.ipAddress = new IPAddressVO(ipAddress).get();
    this.expiresAt = new ExpiresAtVO(expiresAt).get();
  }

  isExpired(): boolean {
    if (Date.now() > this.expiresAt.getTime()) throw new RefreshTokenExpiredError();
    return false;
  }

  isRevoked(): boolean {
    if (this.revoked) throw new RefreshTokenRevokedError();
    return this.revoked;
  }

  isActive(): boolean {
    if (this.isRevoked() || this.isExpired()) throw new Error();
    return true;
  }

  revoke(): void {
    if (!this.revoked) {
      this.revoked = true;
      this.updatedAt = new Date();
    }
  }

  rotateToken(newTokenHashed: string, newExpiresAt: Date) {
    this.tokenHashed = new TokenHashedVO(newTokenHashed).get();
    this.expiresAt = new ExpiresAtVO(newExpiresAt).get();

    if (this.revoked) this.revoked = false;
  }

  get getRevoked(): boolean {
    return this.revoked;
  }

  get getTokenHashed(): string {
    return this.tokenHashed;
  }

  get getExpiredAt(): Date {
    return this.expiresAt;
  }

  get getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
