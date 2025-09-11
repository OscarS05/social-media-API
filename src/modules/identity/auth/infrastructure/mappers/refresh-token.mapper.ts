import { RefreshTokenEntity } from '../../domain/entities/refreshToken.entity';
import { RefreshToken as RefreshTokenOrm } from '../persistence/db/entites/refresh-tokens.orm-entity';

export class RefreshTokenMapper {
  static toDomain(ormEntity: RefreshTokenOrm): RefreshTokenEntity {
    return new RefreshTokenEntity(
      ormEntity.id,
      ormEntity.user?.id ?? ormEntity.userId ?? '',
      ormEntity.tokenHashed,
      ormEntity.userAgent,
      ormEntity.ipAddress,
      ormEntity.revoked,
      ormEntity.expiresAt,
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  static toOrm(domainEntity: RefreshTokenEntity): RefreshTokenOrm {
    const orm = new RefreshTokenOrm();
    orm.id = domainEntity.getId;
    orm.userId = domainEntity.getUserId;
    orm.tokenHashed = domainEntity.getTokenHashed;
    orm.userAgent = domainEntity.getUserAgent;
    orm.ipAddress = domainEntity.getIp;
    orm.revoked = domainEntity.getRevoked;
    orm.expiresAt = domainEntity.getExpiredAt;
    orm.createdAt = domainEntity.createdAt;
    orm.updatedAt = domainEntity.updatedAt;
    return orm;
  }
}
