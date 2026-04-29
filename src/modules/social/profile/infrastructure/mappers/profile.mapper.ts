import { ProfileEntity } from '../../domain/entities/profile.entity';
import { Profiles as ProfileORM } from '../persistence/entities/profiles.orm-entity';

export class ProfileMapper {
  static toDomain(ormEntity: ProfileORM): ProfileEntity {
    return ProfileEntity.fromPersistence({
      userId: ormEntity.user?.id ?? ormEntity.userId ?? '',
      username: ormEntity.username,
      bio: ormEntity.bio,
      typePrivacy: ormEntity.typePrivacy,
      avatarUrl: ormEntity.avatarUrl,
      coverPhotoUrl: ormEntity.coverPhotoUrl,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
      deletedAt: ormEntity.deletedAt,
    });
  }

  static toOrm(domainEntity: ProfileEntity): ProfileORM {
    const orm = new ProfileORM();
    orm.userId = domainEntity.userId;
    orm.username = domainEntity.username;
    orm.bio = domainEntity.bio;
    orm.typePrivacy = domainEntity.typePrivacy;
    orm.avatarUrl = domainEntity.avatarUrl;
    orm.coverPhotoUrl = domainEntity.coverPhotoUrl;
    orm.createdAt = domainEntity.createdAt;
    orm.updatedAt = domainEntity.updatedAt;
    orm.deletedAt = domainEntity.deletedAt;
    return orm;
  }
}
