import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../../../domain/repositories/session.repository';

@Injectable()
export class RevokeAllSessionsUseCase {
  constructor(private readonly sessionRepo: SessionRepository) {}

  public async execute(userId: string): Promise<void> {
    await this.sessionRepo.updateByUserId(userId, {
      revoked: true,
    });
  }
}
