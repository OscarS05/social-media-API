import { AuthIdVO } from '../value-objects/authId.vo';
import { TokenHashedVO } from '../value-objects/tokenHashed.vo';
import { UserAgentVO } from '../value-objects/userAgent.vo';

export class RegreshTokenEntity {
  constructor(
    private readonly id: string,
    private readonly userId: string,
    private readonly tokenHashed: string,
    private readonly userAgent: string,
    private readonly ipAddress: string,
    private readonly revoked: boolean,
    private readonly expiresAt: Date,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {
    this.id = new AuthIdVO(id).get();
    this.userId = new AuthIdVO(userId).get();
    this.tokenHashed = new TokenHashedVO(tokenHashed).get();
    this.userAgent = new UserAgentVO(userAgent).get();
  }
}
