import { UserAgentParsed } from '../services/userAgent.service';

export type GetRefreshToken = {
  id: string;
  userId: string;
  userAgent: UserAgentParsed;
  ipAddress: string;
  revoked: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
