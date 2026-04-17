import { SessionEntity } from '../entities/session.entity';
import { UpdateSession } from '../types/session';

export abstract class SessionRepository {
  abstract create(data: SessionEntity): Promise<SessionEntity>;

  abstract update(sessionId: string, changes: UpdateSession): Promise<void>;

  abstract updateByUserId(userId: string, changes: UpdateSession): Promise<void>;

  abstract findByIdAndUserId(tokenId: string, userId: string): Promise<SessionEntity | null>;

  abstract findAllByUserId(userId: string): Promise<SessionEntity[]>;
}
