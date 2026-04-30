import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';

import { Profiles as ProfilesORM } from '../entities/profiles.orm-entity';
import { Privacy } from '../../../domain/enums/privacy.enum';
import { buildProfileEntity } from '../../../../../../../test/factories/profile.factory';
import { SEEDED_ADMIN } from '../../../../../auth/infrastructure/persistence/db/factory/user.factory';

const profileMock = buildProfileEntity({ ...SEEDED_ADMIN });

export const profileFactoryData = (userId?: string, isAdmin?: boolean): ProfilesORM => {
  const profile = new ProfilesORM();

  profile.userId = isAdmin ? profileMock.userId : (userId ?? '');
  profile.username = isAdmin ? profileMock.username : faker.internet.username().slice(0, 50);
  profile.bio = isAdmin ? profileMock.bio : faker.lorem.sentence().slice(0, 255);
  profile.typePrivacy = isAdmin
    ? profileMock.typePrivacy
    : faker.helpers.arrayElement(Object.values(Privacy) as Privacy[]);
  profile.avatarUrl = isAdmin ? profileMock.avatarUrl : faker.image.avatar();
  profile.coverPhotoUrl = isAdmin ? profileMock.coverPhotoUrl : faker.image.url();
  profile.createdAt = faker.date.past({ years: 1 });
  profile.updatedAt = faker.date.recent({ days: 30 });
  profile.deletedAt = null;

  return profile;
};

export const profileFactory = setSeederFactory(ProfilesORM, () => {
  return profileFactoryData();
});
