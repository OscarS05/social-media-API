import { UserAgentParsed } from '../services/userAgent.service';

export type SessionDataVerified = {
  refreshTokenId: string;
  userId: string;
  parsedUserAgent: UserAgentParsed;
  parsedIp: string;
  createdAt: Date;
  rawIp?: string;
  rawUserAgent?: string;
};
