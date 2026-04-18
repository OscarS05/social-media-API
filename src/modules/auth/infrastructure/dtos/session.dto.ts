import { UserAgentParsed } from '../../domain/services/userAgent.service';

type SessionData = {
  id: string;
  ipAddress: string;
  userAgent: UserAgentParsed;
  expiresAt: Date;
  createdAt: Date;
};

export class SessionResponseDto {
  id!: string;
  ipAddress!: string;
  browser!: string | null;
  os!: string | null;
  device!: string | null;
  createdAt!: Date;
  expiresAt!: Date;

  static fromDomain(session: SessionData): SessionResponseDto {
    return {
      id: session.id,
      ipAddress: session.ipAddress,
      browser: session.userAgent.browser.name ?? null,
      os: session.userAgent.os.name ?? null,
      device: session.userAgent.device.type ?? null,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    };
  }
}
