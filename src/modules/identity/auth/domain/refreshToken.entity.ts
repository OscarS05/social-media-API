export interface RegreshTokenEntity {
  id: string;
  userId: string;
  tokenHashed: string;
  userAgent: string;
  ipAddress: string;
  revoked: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
