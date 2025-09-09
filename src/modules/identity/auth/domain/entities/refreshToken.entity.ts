import { AuthIdVO } from '../value-objects/authId.vo';

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
  }
}
