import { Injectable } from '@nestjs/common';

import { SessionRepository } from '../../../domain/repositories/session.repository';
import { TokenService } from '../../../domain/services/token.service';
import { UnauthorizedError } from '../../../domain/errors/auth.errors';
import { SessionNotFoundError } from '../../../domain/errors/session.errors';

@Injectable()
export class RevokeOneSessionUseCase {
  constructor(
    private readonly tokenService: TokenService,
    private readonly sessionRepo: SessionRepository,
  ) {}

  async execute(refreshToken: string, userId: string): Promise<void> {
    const { jti, sub } = this.tokenService.verifyRefreshToken(refreshToken);

    if (sub !== userId) throw new UnauthorizedError();

    const session = await this.sessionRepo.findByIdAndUserId(jti, userId);
    if (!session) throw new SessionNotFoundError();

    await this.sessionRepo.update(jti, { revoked: true });
  }
}
