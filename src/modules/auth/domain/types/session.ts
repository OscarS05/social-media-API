import { UserAgentParsed } from '../services/userAgent.service';
import { Roles } from '../enums/roles.enum';
import { UserBasic } from './user';

export type Session = {
  id: string;
  userId: string;
  userAgent: UserAgentParsed;
  tokenHashed: string;
  version: number;
  ipAddress: string;
  revoked: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateSessionData = Omit<Session, 'revoked' | 'createdAt' | 'updatedAt'>;

export type SessionContext = {
  userAgent: UserAgentParsed;
  ipAddress: string;
};

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type UpdateSession = {
  tokenHashed?: string;
  revoked?: boolean;
  version?: number;
  expiresAt?: Date;
};

export type LoginData = { user: UserBasic; tokens: Tokens };
export type LoginResponse = { user: UserBasic; accessToken: string };

export type SessionData = {
  accessToken: string;
  refreshToken: string;
  userAgent: UserAgentParsed;
  ipAddress: string;
};

export type SessionDataVerified = {
  refreshTokenId: string;
  userId: string;
  role: Roles;
};

export type PayloadRefreshToken = {
  sub: string;
  jti: string;
  version: number;
};

export type PayloadAccessToken = {
  sub: string;
  role: Roles;
};

export interface TokenSignOptions {
  secret: string;
  expiresIn: string;
}
