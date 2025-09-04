import { UserEntity } from '../../../domain/entities/user.entity';
import { User as UserOrmEntity } from '../db/entities/user.orm-entity';

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

  // static toOrm(domainEntity: UserEntity): UserOrmEntity {
  //   const orm = new UserOrmEntity();
  //   orm.userId = domainEntity.userId;
  //   orm.email = domainEntity.email;
  //   orm.password = domainEntity.password;
  //   return orm;
  // }
}
