import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';

import { createTestApp } from '../app.e2e';
import MainSeeder from '../../../src/shared/database/seeders/app.seeder';
// import { Auth } from '../../../src/modules/identity/auth/infrastructure/persistence/db/entites/auth.orm-entity';
// import { User } from '../../../src/modules/identity/users/infrastructure/persistence/db/entities/user.orm-entity';
import { UserEntity } from '../../../src/modules/identity/users/domain/entities/user.entity';

describe('User e2e - identity/user', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let name: string;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);

    await dataSource.dropDatabase();
    await dataSource.runMigrations();
    await new MainSeeder().runTestSeeders(dataSource, 1, 0);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    beforeEach(() => {
      name = 'admin test';
    });

    it('returns user saved', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({ name })
        .expect(201);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const user = res.body.user as UserEntity;

      expect(user.name).toBe(name);
      expect(typeof user.id).toBe('string');
      expect(user.role).toBe('member');
      expect(user.deletedAt).toBeNull();
      expect(typeof user.createdAt).toBe('string');
    });

    it('400 with wrong name', async () => {
      name = 'SELECT * FROM AUTH;';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await request(app.getHttpServer()).post('/users').send({ name }).expect(400);
    });
  });
});
