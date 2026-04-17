import { SessionEntity } from '../../domain/entities/session.entity';
import { Session as SessionORM } from '../persistence/db/entites/sessions.orm-entity';

export class SessionMapper {
  static toDomain(ormEntity: SessionORM): SessionEntity {
    return SessionEntity.fromPersistence({
      id: ormEntity.id,
      userId: ormEntity.user?.id ?? ormEntity.userId ?? '',
      tokenHashed: ormEntity.tokenHashed,
      version: ormEntity.version,
      userAgent: ormEntity.userAgent,
      ipAddress: ormEntity.ipAddress,
      revoked: ormEntity.revoked,
      expiresAt: ormEntity.expiresAt,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  static toOrm(domainEntity: SessionEntity): SessionORM {
    const orm = new SessionORM();
    orm.id = domainEntity.id;
    orm.userId = domainEntity.userId;
    orm.tokenHashed = domainEntity.tokenHashed;
    orm.version = domainEntity.version;
    orm.userAgent = domainEntity.userAgent;
    orm.ipAddress = domainEntity.ipAddress;
    orm.revoked = domainEntity.revoked;
    orm.expiresAt = domainEntity.expiresAt;
    orm.createdAt = domainEntity.createdAt;
    orm.updatedAt = domainEntity.updatedAt;
    return orm;
  }
}
