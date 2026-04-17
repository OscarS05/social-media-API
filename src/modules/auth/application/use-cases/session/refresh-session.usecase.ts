import { Injectable } from '@nestjs/common';
import { SessionManagerService } from '../../services/session-manager.service';
import { SessionContext, Tokens } from '../../../domain/types/session';
import { TokenService } from '../../../domain/services/token.service';
import { SessionRepository } from '../../../domain/repositories/session.repository';
import { HasherService } from '../../../domain/services/hasher.service';
import { InvalidTokenError } from '../../../domain/errors/session.errors';

@Injectable()
export class RefreshSessionUseCase {
  constructor(
    private readonly sessionManagerService: SessionManagerService,
    private readonly sessionRepo: SessionRepository,
    private readonly tokenService: TokenService,
    private readonly hasherService: HasherService,
  ) {}

  public async execute(context: SessionContext, tokens: Tokens): Promise<Tokens> {
    const { role } = this.tokenService.verifyAccessToken(tokens.accessToken);
    const { sub, jti, version } = this.tokenService.verifyRefreshToken(tokens.refreshToken);

    const session = await this.sessionRepo.findByIdAndUserId(jti, sub);
    if (!session) throw new Error('Session not found');
    session.isActive();

    if (session.version !== version) {
      await this.sessionRepo.updateByUserId(sub, { revoked: true });
      throw new InvalidTokenError('Token version mismatch');
    }

    const isValid = await this.hasherService.compare(tokens.refreshToken, session.tokenHashed);
    if (!isValid) {
      session.revoke();
      await this.sessionRepo.update(session.id, { revoked: true });
      throw new InvalidTokenError();
    }

    const deviceValid = Object.entries(context.userAgent).every(
      ([key, value]) => session.userAgent[key] === value,
    );
    if (!deviceValid) {
      session.revoke();
      await this.sessionRepo.update(session.id, { revoked: true });
      throw new InvalidTokenError('Session context mismatch');
    }

    return this.sessionManagerService.rotateSession(session, role);
  }
}
