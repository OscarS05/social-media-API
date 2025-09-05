import { Roles } from '../../domain/entities/roles.enum';
import { UserEntity } from '../../domain/entities/user.entity';
import { User as UserOrmEntity } from '../persistence/db/entities/user.orm-entity';

export class UserMapper {
  static toDomain(ormEntity: UserOrmEntity): UserEntity {
    return new UserEntity(
      ormEntity.id,
      ormEntity.name,
      ormEntity.role,
      ormEntity.createdAt,
      ormEntity.updatedAt,
      ormEntity.deletedAt,
    );
  }

  static toOrm(domainEntity: UserEntity): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = domainEntity.id;
    orm.name = domainEntity.name;
    orm.role = domainEntity.role as Roles;
    orm.createdAt = domainEntity.createdAt as Date;
    orm.updatedAt = domainEntity.updatedAt as Date;
    orm.deletedAt = domainEntity.deletedAt as Date | null;
    return orm;
  }
}
