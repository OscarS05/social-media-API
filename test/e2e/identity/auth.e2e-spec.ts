/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';

import { createTestApp } from '../app.e2e';
import MainSeeder from '../../../src/shared/database/seeders/app.seeder';
// import { Auth } from '../../../src/modules/identity/auth/infrastructure/persistence/db/entites/auth.orm-entity';
// import { User } from '../../../src/modules/identity/users/infrastructure/persistence/db/entities/user.orm-entity';

describe('Auth e2e - identity/auth', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let email: string;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);

    await dataSource.dropDatabase();
    await dataSource.runMigrations();
    await new MainSeeder().runTestSeeders(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    beforeEach(() => {
      email = 'admin@test.com';
    });

    it('returns access token with correct credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'password' })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(typeof res.body.accessToken).toBe('string');
    });

    it('400 with wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'b2' })
        .expect(400);
    });

    it('400 with wrong email', async () => {
      email = 'admin@test@com';

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'password' })
        .expect(400);
    });
  });

  describe('POST /auth/register', () => {
    beforeEach(() => {
      email = 'admin2@test.com';
    });

    it('returns a new user with 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'test', email, password: 'password' })
        .expect(201);

      expect(res.body.user).toHaveProperty('email');
      expect(res.body.user).toHaveProperty('name');
    });

    it('400 with wrong name', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'te', email, password: 'password' })
        .expect(400);
    });
  });
});
