import { Server } from 'node:http';
import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import request, { Response } from 'supertest';
import { JwtService } from '@nestjs/jwt';

import { createTestApp } from '../../app.e2e';
import { Profiles as ProfileORM } from '../../../../src/modules/social/profile/infrastructure/persistence/entities/profiles.orm-entity';
import MainSeeder from '../../../../src/shared/database/seeders/app.seeder';
import { SeedersTag } from '../../../../src/shared/database/seeders/config/types';
import { ADMIN_ID, MEMBER_ID } from '../../../factories/user.factory';
import { USERNAME } from '../../../factories/profile.factory';
import { Privacy } from '../../../../src/modules/social/profile/domain/enums/privacy.enum';
import {
  CreateProfileDto,
  ProfileResponseDto,
} from '../../../../src/modules/social/profile/infrastructure/dtos/profile.dto';
import { ImageManagerService } from '../../../../src/shared/infrastructure/services/image-manager.service';
import { ImageLocalService } from '../../../../src/shared/infrastructure/services/image-local.service';

describe('Profile e2e - social/profile', () => {
  let app: INestApplication;
  let server: Server;
  let dataSource: DataSource;
  let profileRepo: Repository<ProfileORM>;
  const imageLocalService = new ImageLocalService();
  const imageManager = new ImageManagerService(imageLocalService);
  const jwtService = new JwtService();
  const accessToken = jwtService.sign(
    { sub: MEMBER_ID },
    { expiresIn: '5m', secret: process.env.ACCESS_SECRET },
  );
  const expiredToken = jwtService.sign(
    { sub: MEMBER_ID },
    { expiresIn: -1, secret: process.env.ACCESS_SECRET },
  );

  const body: CreateProfileDto = {
    username: USERNAME,
    bio: null,
    typePrivacy: Privacy.PUBLIC,
  };

  const testImagesSaved: string[] = [];

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer() as Server;
    dataSource = app.get(DataSource);
    await dataSource.dropDatabase();
    await dataSource.runMigrations();
    await new MainSeeder().runTestSeeders(dataSource, [
      SeedersTag.SESSIONS,
      SeedersTag.SESSIONS,
      SeedersTag.PROFILE,
    ]);

    profileRepo = dataSource.getRepository(ProfileORM);
  });

  // afterEach(async () => {
  //   await profileRepo.deleteAll();
  //   await new MainSeeder().runTestSeeders(dataSource, [SeedersTag.PROFILE]);
  // });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await app.close();
    await imageManager.deleteImages(testImagesSaved);
  });

  describe('POST /profile', () => {
    it('returns a new profile without images 201', async () => {
      await profileRepo.delete({ userId: MEMBER_ID });

      const res = await request(server)
        .post('/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('username', body.username)
        .field('typePrivacy', body.typePrivacy)
        .field('bio', '')
        .expect(201);

      const resBody = res.body as ProfileResponseDto;

      const newProfile = await profileRepo.findOne({ where: { userId: resBody.userId } });

      expect(newProfile).toBeTruthy();
      expect(resBody).toMatchObject(body);
    });

    it('returns a new profile with images 201', async () => {
      await profileRepo.delete({ userId: MEMBER_ID });

      const res = await request(server)
        .post('/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('username', body.username)
        .field('typePrivacy', body.typePrivacy)
        .field('bio', '')
        .attach('avatar', Buffer.from('fake-avatar-image'), { filename: 'avatar.png' })
        .attach('coverPhoto', Buffer.from('fake-cover-image'), { filename: 'cover.webp' })
        .expect(201);

      const resBody = res.body as ProfileResponseDto;

      const profile = await profileRepo.findOne({
        where: { userId: resBody.userId },
      });

      expect(profile).toBeTruthy();

      expect(profile?.avatarUrl).toBeTruthy();
      expect(profile?.avatarUrl).toMatch('/uploads/avatars/');
      expect(profile?.coverPhotoUrl).toBeTruthy();
      expect(profile?.coverPhotoUrl).toMatch('/uploads/covers/');

      expect(resBody.username).toBe(body.username);

      testImagesSaved.push(profile?.avatarUrl || '');
      testImagesSaved.push(profile?.coverPhotoUrl || '');
    });

    it('returns a new profile with avatar 201', async () => {
      await profileRepo.delete({ userId: MEMBER_ID });

      const res = await request(server)
        .post('/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('username', body.username)
        .field('typePrivacy', body.typePrivacy)
        .field('bio', '')
        .attach('avatar', Buffer.from('fake-avatar-image'), { filename: 'avatar.png' })
        .expect(201);

      const resBody = res.body as ProfileResponseDto;

      const profile = await profileRepo.findOne({
        where: { userId: resBody.userId },
      });

      expect(profile).toBeTruthy();

      expect(profile?.avatarUrl).toBeTruthy();
      expect(profile?.coverPhotoUrl).not.toBeTruthy();

      expect(resBody.username).toBe(body.username);

      testImagesSaved.push(profile?.avatarUrl || '');
      testImagesSaved.push(profile?.coverPhotoUrl || '');
    });

    it('409 with profile already exists', async () => {
      await request(server)
        .post('/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('username', body.username)
        .field('typePrivacy', body.typePrivacy)
        .field('bio', '')
        .expect(409);
    });

    it('409 with username already in use', async () => {
      await profileRepo.delete({ userId: MEMBER_ID });
      await profileRepo.update(ADMIN_ID, { username: body.username });

      await request(server)
        .post('/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('username', body.username)
        .field('typePrivacy', body.typePrivacy)
        .field('bio', '')
        .expect(409);
    });

    it('400 with invalid image extension', async () => {
      await request(server)
        .post('/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('username', body.username)
        .field('typePrivacy', body.typePrivacy)
        .field('bio', '')
        .attach('avatar', Buffer.from('fake-avatar-image'), { filename: 'avatar.pdf' })
        .expect(400);
    });

    it('400 with invalid type image', async () => {
      await request(server)
        .post('/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('username', body.username)
        .field('typePrivacy', body.typePrivacy)
        .field('bio', '')
        .attach('avatar', Buffer.from(''), { filename: 'avatar.pdf' })
        .expect(400);
    });

    it('401 without token', async () => {
      await request(server)
        .post('/profile')
        .set('Authorization', `Bearer invalidToken`)
        .expect(401);
    });

    it('401 with expired token', async () => {
      await request(server)
        .post('/profile')
        .set('Authorization', `Bearer ${expiredToken}]`)
        .expect(401);
    });

    it('400 with invalid username', async () => {
      await request(server)
        .post('/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('username', 'invalid__username')
        .field('typePrivacy', body.typePrivacy)
        .field('bio', '')
        .expect(400);
    });

    it('400 with missing fields', async () => {
      await request(server)
        .post('/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('typePrivacy', body.typePrivacy)
        .field('bio', '')
        .expect(400);
    });
  });
});
