import { UserEntity } from '../../domain/entities/user.entity';
import { User as UserOrmEntity } from '../persistence/db/entites/user.orm-entity';

export class UserMapper {
  static toDomain(ormEntity: UserOrmEntity): UserEntity {
    return UserEntity.fromPersistence({
      id: ormEntity.id,
      name: ormEntity.name,
      role: ormEntity.role,
      provider: ormEntity.provider,
      isVerified: ormEntity.isVerified,
      email: ormEntity.email,
      password: ormEntity.password || null,
      providerId: ormEntity.providerId || null,
      resetToken: ormEntity.resetToken || null,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
      deletedAt: ormEntity.deletedAt || null,
    });
  }

  static toOrm(domainEntity: UserEntity): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = domainEntity.id;
    orm.name = domainEntity.name;
    orm.role = domainEntity.role;
    orm.provider = domainEntity.provider;
    orm.isVerified = domainEntity.isVerified;
    orm.email = domainEntity.email;
    orm.password = domainEntity.password || null;
    orm.providerId = domainEntity.providerId || null;
    orm.resetToken = domainEntity.resetToken || null;
    orm.createdAt = domainEntity.createdAt;
    orm.updatedAt = domainEntity.updatedAt;
    orm.deletedAt = domainEntity.deletedAt;
    return orm;
  }
}
