jest.mock('@faker-js/faker', () => ({
  faker: {
    string: { uuid: () => '1960c469-381d-4603-ac6a-88ef9c989966' },
    internet: { username: () => 'testuser' },
    lorem: { sentence: () => 'bio' },
    image: { avatar: () => 'avatar.jpg', url: () => 'cover.jpg' },
    helpers: { arrayElement: (arr: Privacy[]) => arr[0] },
    date: {
      past: () => new Date(),
      recent: () => new Date(),
    },
  },
}));

import { DataSource, Repository } from 'typeorm';
import { Profiles as ProfileORM } from '../../../../../../src/modules/social/profile/infrastructure/persistence/entities/profiles.orm-entity';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import MainSeeder from '../../../../../../src/shared/database/seeders/app.seeder';
import { typeOrmConfig } from '../../../../../../src/shared/database/config/typeorm.config';
import {
  buildProfileEntity,
  NEW_USERNAME,
  USERNAME,
} from '../../../../../factories/profile.factory';
import { ProfileRepositoryTypeORM } from '../../../../../../src/modules/social/profile/infrastructure/persistence/repositories/profiles.repository';
import { Privacy } from '../../../../../../src/modules/social/profile/domain/enums/privacy.enum';
import { SEEDED_ADMIN, SEEDED_MEMBER } from '../../../../../factories/user.factory';
import { SECOND_SESSION_ID } from '../../../../../factories/session.factory';

describe('UserRepository (integration)', () => {
  let dataSource: DataSource;
  let profileRepoInstance: Repository<ProfileORM>;
  let profileRepo: ProfileRepositoryTypeORM;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(typeOrmConfig), TypeOrmModule.forFeature([ProfileORM])],
      providers: [ProfileRepositoryTypeORM],
    }).compile();

    dataSource = module.get(DataSource);
    profileRepo = module.get(ProfileRepositoryTypeORM);
    profileRepoInstance = dataSource.getRepository(ProfileORM);

    await dataSource.dropDatabase();
    await dataSource.runMigrations();

    await new MainSeeder().runTestSeeders(dataSource, ['users', 'sessions']);
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
  });

  describe('.create()', () => {
    afterEach(async () => {
      await profileRepoInstance.deleteAll();
      await new MainSeeder().runTestSeeders(dataSource, ['profile']);
    });

    it('should create a profile successfully', async () => {
      await profileRepoInstance.delete({ userId: SEEDED_ADMIN.id });
      const profile = buildProfileEntity({ userId: SEEDED_ADMIN.id });
      const newProfile = await profileRepo.create(profile);
      expect(newProfile).toMatchObject(profile.toBasic());
    });

    it('should fail if username is duplicated', async () => {
      const profileExisting = await profileRepoInstance.find();
      await profileRepoInstance.delete({ userId: profileExisting[1].userId });
      const profile = buildProfileEntity({
        username: profileExisting[0].username,
        userId: profileExisting[1].userId,
      }); // Different userId
      await expect(profileRepo.create(profile)).rejects.toThrow();
    });
  });

  describe('.update()', () => {
    afterEach(async () => {
      await profileRepoInstance.deleteAll();
      await new MainSeeder().runTestSeeders(dataSource, ['profile']);
    });

    let profilesExisting: ProfileORM[] = [];

    beforeAll(async () => {
      profilesExisting = await profileRepoInstance.find();
    });

    it('should update a profile successfully', async () => {
      const changes = {
        username: NEW_USERNAME,
        bio: 'new bio 123',
        avatarUrl: '/new/url',
        typePrivacy: Privacy.PUBLIC,
      };
      const newUpdatedAt = new Date(new Date().getTime() + 1000);
      const newProfile = await profileRepo.update(profilesExisting[0].userId, {
        ...changes,
        updatedAt: newUpdatedAt,
      });
      expect(profilesExisting[0].username).not.toBe(changes.username);
      expect(newProfile.toBasic()).toMatchObject(changes);
      expect(newUpdatedAt.getTime()).toBeGreaterThanOrEqual(
        profilesExisting[0].updatedAt.getTime(),
      );
    });

    it('should fail if username is duplicated', async () => {
      const changes = {
        username: profilesExisting[0].username,
        updatedAt: new Date(),
      }; // Different userId

      // update the a username already in use by profile[0]
      await expect(profileRepo.update(profilesExisting[1].userId, changes)).rejects.toThrow();
    });
  });

  describe('.delete()', () => {
    afterEach(async () => {
      await profileRepoInstance.deleteAll();
      await new MainSeeder().runTestSeeders(dataSource, ['profile']);
    });

    it('should delete a profile successfully', async () => {
      const totalProfilesBefore = await profileRepoInstance.find();
      const result = await profileRepo.delete(SEEDED_MEMBER.id);
      const totalProfilesAfter = await profileRepoInstance.find();

      expect(result).toBeUndefined();
      expect(totalProfilesBefore.length).toBe(2);
      expect(totalProfilesAfter.length).toBe(1);
    });

    it('should ignore if profile does not exists or already was deleted', async () => {
      const result = await profileRepo.delete(SEEDED_MEMBER.id);
      expect(result).toBeUndefined();
    });
  });

  describe('.findAllProfilesByUsername()', () => {
    it('should find all profiles by query and return profile reviews', async () => {
      const query = 'user';

      const profiles = await profileRepoInstance.find();
      const mapped = profiles.map((p) => ({
        userId: p.userId,
        username: p.username,
        avatarUrl: p.avatarUrl,
      }));
      const result = await profileRepo.findAllProfilesByUsername(query);

      expect(result).toMatchObject(mapped);
    });
  });

  describe('.findByUserId()', () => {
    it('should find the profile successfully', async () => {
      const result = await profileRepo.findByUserId(SEEDED_MEMBER.id);

      expect(result?.toBasic().userId).toBe(SEEDED_MEMBER.id);
    });

    it('should not find the profile', async () => {
      const result = await profileRepo.findByUserId(SECOND_SESSION_ID); // this id does not exists in profiles table

      expect(result).toBeNull();
    });
  });

  describe('.findByUserName()', () => {
    it('should find the profile successfully', async () => {
      const result = await profileRepo.findByUserName(USERNAME);

      expect(result?.toBasic().username).toBe(USERNAME);
      expect(result?.toBasic().userId).toBeDefined();
    });

    it('should not find the profile', async () => {
      const result = await profileRepo.findByUserName('username_not_exist');

      expect(result).toBeNull();
    });
  });

  describe('.findUsernames()', () => {
    it('should find usernames successfully', async () => {
      const query = 'user';
      const result = await profileRepo.findUsernames(query);

      expect(result.length).toBe(2); // Total profiles created in seeders
      expect(result.includes(USERNAME)).toBeTruthy();
      expect(result.includes(buildProfileEntity().username)).toBeTruthy();
    });

    it('should not find the profile', async () => {
      const result = await profileRepo.findUsernames('username_not_exist');

      expect(result.length).toBe(0);
    });
  });

  describe('.getProfileAccessContext()', () => {
    // TODO when follows, blocks and posts is ready
  });

  describe('.getProfileBaseView()', () => {
    // TODO when follows, blocks and posts is ready
  });
});
