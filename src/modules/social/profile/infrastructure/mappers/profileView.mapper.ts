import { ProfileEntity } from '../../domain/entities/profile.entity';
import { ProfileView } from '../../domain/types/profile';
import { ProfileDataRaw } from '../persistence/repositories/profiles.repository';

export class ProfileViewMapper {
  static fromRaw(raw: ProfileDataRaw): ProfileView {
    const profile = ProfileEntity.fromPersistence({
      userId: raw.userId,
      username: raw.username,
      bio: raw.bio,
      typePrivacy: raw.typePrivacy,
      avatarUrl: raw.avatarUrl,
      coverPhotoUrl: raw.coverPhotoUrl,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });

    return {
      profile: profile,
      relations: {
        followers: Number(raw.followers),
        following: Number(raw.following),
      },
      posts: [],
    };
  }
}
