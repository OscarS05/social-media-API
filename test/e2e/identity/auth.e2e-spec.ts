import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { createTestApp } from '../app.e2e';
import MainSeeder from '../../../src/shared/database/seeders/app.seeder';
import { Auth } from '../../../src/modules/identity/auth/infrastructure/persistence/db/entites/auth.orm-entity';
import { User } from '../../../src/modules/identity/users/infrastructure/persistence/db/entities/user.orm-entity';

describe('Auth e2e - identity/auth', () => {
  let app: INestApplication;
  let userData: { adminUser: User; authAdmin: Auth };

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeAll(async () => {
    const dataSource = app.get(DataSource);
    userData = await new MainSeeder().runTestSeeders(dataSource);
  });

  it('test db', () => {
    console.log(userData);
    expect(userData.adminUser).toEqual(expect.objectContaining({ name: 'admin-test' }));
  });

  // it('POST /auth/login -> returns access token with correct credentials', async () => {
  //   const res = await request(app.getHttpServer())
  //     .post('/auth/login')
  //     .send({ email: registerDto.email, password: registerDto.password })
  //     .expect(200);

  //   expect(res.body).toHaveProperty('accessToken');
  //   expect(typeof res.body.accessToken).toBe('string');
  // });

  // it('POST /auth/login -> 401 with wrong password', async () => {
  //   await request(app.getHttpServer())
  //     .post('/auth/login')
  //     .send({ email: registerDto.email, password: 'badpass' })
  //     .expect(401);
  // });
});
