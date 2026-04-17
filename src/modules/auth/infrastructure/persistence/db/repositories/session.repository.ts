import { InjectRepository } from '@nestjs/typeorm';

import { SessionEntity } from '../../../../domain/entities/session.entity';
import { SessionRepository } from '../../../../domain/repositories/session.repository';
import { Session as SessionEntityORM } from '../entites/sessions.orm-entity';
import { SessionMapper } from '../../../mappers/session.mapper';
import { Repository } from 'typeorm';
import { UpdateSession } from '../../../../domain/types/session';

export class SessionRepositoryORM extends SessionRepository {
  constructor(
    @InjectRepository(SessionEntityORM)
    private readonly ormRepo: Repository<SessionEntityORM>,
  ) {
    super();
  }

  async create(data: SessionEntity): Promise<SessionEntity> {
    const ormEntity: SessionEntityORM = SessionMapper.toOrm(data);
    const newSession = await this.ormRepo.save(ormEntity);

    return SessionMapper.toDomain(newSession);
  }

  async update(sessionId: string, changes: UpdateSession): Promise<void> {
    await this.ormRepo.update({ id: sessionId, revoked: false }, changes);
  }

  async updateByUserId(userId: string, changes: UpdateSession): Promise<void> {
    await this.ormRepo.update({ userId, revoked: false }, changes);
  }

  async findByIdAndUserId(tokenId: string, userId: string): Promise<SessionEntity | null> {
    const session = await this.ormRepo.findOne({
      where: { id: tokenId, userId, revoked: false },
    });
    return session ? SessionMapper.toDomain(session) : null;
  }

  async findAllByUserId(userId: string): Promise<SessionEntity[]> {
    const sessions = await this.ormRepo.find({ where: { userId, revoked: false } });
    return sessions.map((session) => SessionMapper.toDomain(session));
  }
}
