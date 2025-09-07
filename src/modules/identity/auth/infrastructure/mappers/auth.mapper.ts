import { AuthEntity } from '../../domain/entities/auth.entity';
import { Auth as AuthOrmEntity } from '../persistence/db/entites/auth.orm-entity';

export class AuthMapper {
  static toDomain(ormEntity: AuthOrmEntity): AuthEntity {
    return new AuthEntity(
      ormEntity.id,
      ormEntity.user?.id ?? ormEntity.userId ?? '',
      ormEntity.provider,
      ormEntity.isVerified,
      ormEntity.createdAt,
      ormEntity.updatedAt,
      ormEntity.email ?? null,
      ormEntity.password ?? null,
      ormEntity.providerUserId ?? null,
      ormEntity.resetToken ?? null,
      ormEntity.deletedAt ?? null,
      ormEntity.user ?? null,
    );
  }

  static toOrm(domainEntity: AuthEntity): AuthOrmEntity {
    const orm = new AuthOrmEntity();
    orm.id = domainEntity.getId;
    orm.userId = domainEntity.getUserId;
    orm.email = domainEntity.getEmail ?? null;
    orm.password = domainEntity.getPassword ?? null;
    orm.provider = domainEntity.provider;
    orm.providerUserId = domainEntity.providerUserId ?? null;
    orm.resetToken = domainEntity.resetToken ?? null;
    orm.isVerified = domainEntity.isVerified;
    orm.deletedAt = domainEntity.deletedAt ?? null;
    orm.createdAt = domainEntity.createdAt;
    orm.updatedAt = domainEntity.updatedAt;
    return orm;
  }
}
