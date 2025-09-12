export type UpdateRefreshTokenDto = {
  tokenHashed: string;
  expiresAt: Date;
  updatedAt: Date;
  revoked?: boolean;
};
