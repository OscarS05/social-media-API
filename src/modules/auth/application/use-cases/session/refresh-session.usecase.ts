import { Injectable } from '@nestjs/common';
import { SessionManagerService } from '../../services/session-manager.service';
import { SessionContext, Tokens } from '../../../domain/types/session';
import { TokenService } from '../../../domain/services/token.service';
import { SessionRepository } from '../../../domain/repositories/session.repository';
import { HasherService } from '../../../domain/services/hasher.service';
import { UserAgentParsed } from '../../../domain/services/userAgent.service';
import { InvalidTokenError } from '../../../domain/errors/auth.errors';
import { SessionNotFoundError } from '../../../domain/errors/session.errors';

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
    if (!session) throw new SessionNotFoundError();
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

    const deviceValid = this.isSameDevice(session.userAgent, context.userAgent);

    if (!deviceValid) {
      session.revoke();
      await this.sessionRepo.update(session.id, { revoked: true });
      throw new InvalidTokenError('Session context mismatch');
    }

    return this.sessionManagerService.rotateSession(session, role);
  }

  private isSameDevice(storedAgent: UserAgentParsed, incomingAgent: UserAgentParsed): boolean {
    const areEqual = (a: unknown, b: unknown) =>
      a === b || (a === undefined && b === undefined);

    return (
      storedAgent.os.name === incomingAgent.os.name &&
      storedAgent.browser.name === incomingAgent.browser.name &&
      storedAgent.cpu.architecture === incomingAgent.cpu.architecture &&
      areEqual(storedAgent.device.vendor, incomingAgent.device.vendor) &&
      areEqual(storedAgent.device.type, incomingAgent.device.type) &&
      areEqual(storedAgent.device.model, incomingAgent.device.model)
    );
  }
}
