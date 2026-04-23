import { ProfileEntity } from '../../src/modules/social/profile/domain/entities/profile.entity';
import { Privacy } from '../../src/modules/social/profile/domain/enums/privacy.enum';
import { ImageData, Profile } from '../../src/modules/social/profile/domain/types/profile';

export const buildProfileEntity = (overrides?: Partial<Profile>): ProfileEntity => {
  return ProfileEntity.create({
    userId: '68c07572-ff80-4326-8aff-3d109fbd5bcb',
    username: 'newusername',
    typePrivacy: Privacy.PUBLIC,
    bio: 'My bio',
    avatarUrl: null,
    coverPhotoUrl: null,
    ...overrides,
  });
};

export const avatarData: ImageData = {
  buffer: Buffer.from('avatar-data'),
  filename: 'avatar.jpg',
};

export const coverData: ImageData = {
  buffer: Buffer.from('cover-data'),
  filename: 'cover.jpg',
};

export const CDN_URL = 'https://google.cloud.com/cdn/bucket/uuid-123';
export const AVATAR_URL = '/images/avatar-123.jpg';
export const COVER_URL = '/images/cover-123.jpg';
