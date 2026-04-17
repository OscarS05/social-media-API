import { Injectable } from '@nestjs/common';

import { SessionRepository } from '../../../domain/repositories/session.repository';
import { SessionEntity } from '../../../domain/entities/session.entity';

@Injectable()
export class FindAllSessionsUseCase {
  constructor(private readonly sessionRepo: SessionRepository) {}

  public async execute(userId: string): Promise<SessionEntity[]> {
    return await this.sessionRepo.findAllByUserId(userId);
  }
}
