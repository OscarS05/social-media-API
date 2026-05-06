import { ApiProperty } from '@nestjs/swagger';
import { UserAgentParsed } from '../../domain/services/userAgent.service';

type SessionData = {
  id: string;
  ipAddress: string;
  userAgent: UserAgentParsed;
  expiresAt: Date;
  createdAt: Date;
};

export class SessionResponseDto {
  @ApiProperty({ example: '786cf5cc-9cdb-4553-88cb-9c65b3e136da' })
  id!: string;

  @ApiProperty({ example: '127.0.0.1' })
  ipAddress!: string;

  @ApiProperty({ example: 'Firefox' })
  browser!: string | null;

  @ApiProperty({ example: 'Linux' })
  os!: string | null;

  @ApiProperty({ example: 'desktop Dell XPS 15' })
  device!: string | null;

  @ApiProperty({ example: new Date() })
  createdAt!: Date;

  @ApiProperty({ example: new Date(new Date().getTime() + 86400) })
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
