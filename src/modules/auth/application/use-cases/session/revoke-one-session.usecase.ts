import { Injectable } from '@nestjs/common';

import { SessionRepository } from '../../../domain/repositories/session.repository';
import { UnauthorizedError } from '../../../domain/errors/auth.errors';
import { SessionNotFoundError } from '../../../domain/errors/session.errors';

@Injectable()
export class RevokeOneSessionUseCase {
  constructor(private readonly sessionRepo: SessionRepository) {}

  async execute(sessionId: string, userId: string): Promise<void> {
    const session = await this.sessionRepo.findByIdAndUserId(sessionId, userId);
    if (!session) throw new SessionNotFoundError();
    if (session.userId !== userId) throw new UnauthorizedError();
    await this.sessionRepo.update(sessionId, { revoked: true });
  }
}
