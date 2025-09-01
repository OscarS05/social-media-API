import { AuthEntity } from '../../../domain/entities/auth.entity';
import { Auth as AuthOrmEntity } from '../db/entites/auth.orm-entity';

export class AuthMapper {
  static toDomain(ormEntity: AuthOrmEntity): AuthEntity {
    // console.log(ormEntity);
    return new AuthEntity(
      ormEntity.id,
      ormEntity.user?.id ?? '',
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

  // static toOrm(domainEntity: AuthEntity): AuthOrmEntity {
  //   const orm = new AuthOrmEntity();
  //   orm.user = { id: domainEntity.userId };
  //   orm.email = domainEntity.email;
  //   orm.password = domainEntity.password;
  //   return orm;
  // }
}
