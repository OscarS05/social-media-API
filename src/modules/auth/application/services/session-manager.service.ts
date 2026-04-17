import { Injectable } from '@nestjs/common';

import { TokenService } from '../../domain/services/token.service';
import { HasherService } from '../../domain/services/hasher.service';
import { UuidService } from '../../domain/services/uuid.service';
import { SessionContext, Tokens } from '../../domain/types/session';
import { SessionRepository } from '../../domain/repositories/session.repository';
import { SessionEntity } from '../../domain/entities/session.entity';
import { Roles } from '../../domain/enums/roles.enum';

@Injectable()
export class SessionManagerService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly hasherService: HasherService,
    private readonly uuidService: UuidService,
    private readonly sessionRepository: SessionRepository,
  ) {}

  public async createSession(
    data: SessionContext,
    userId: string,
    role: Roles,
  ): Promise<Tokens> {
    const jti = this.uuidService.generate();
    const version = 1;

    const { accessToken, refreshToken } = this.generateTokens(userId, role, jti, version);

    const refreshTokenHashed = await this.hasherService.hash(refreshToken);
    await this.sessionRepository.create(
      SessionEntity.create({
        id: jti,
        userId: userId,
        tokenHashed: refreshTokenHashed,
        version,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        expiresAt: this.tokenService.getRefreshTokenExpiration(),
      }),
    );

    return { accessToken, refreshToken };
  }

  public async rotateSession(session: SessionEntity, role: Roles): Promise<Tokens> {
    const jti = session.id;
    const newVersion = session.version + 1;

    const { accessToken, refreshToken } = this.generateTokens(
      session.userId,
      role,
      jti,
      newVersion,
    );

    const tokenHashed = await this.hasherService.hash(refreshToken);
    session.rotateToken(
      tokenHashed,
      this.tokenService.getRefreshTokenExpiration(),
      newVersion,
    );

    await this.sessionRepository.update(session.id, {
      tokenHashed: session.tokenHashed,
      version: session.version,
      expiresAt: session.expiresAt,
      revoked: session.revoked,
    });

    return { accessToken, refreshToken };
  }

  private generateTokens(userId: string, role: Roles, jti: string, version: number): Tokens {
    const accessToken = this.tokenService.accessToken({
      sub: userId,
      role,
    });
    const refreshToken = this.tokenService.refreshToken({
      sub: userId,
      jti,
      version,
    });

    return { accessToken, refreshToken };
  }
}
