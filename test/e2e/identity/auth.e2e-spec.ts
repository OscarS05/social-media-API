import { INestApplication } from '@nestjs/common';

import { createTestApp } from '../app.e2e';
import UserFactory from '../../../src/shared/database/factories/user.factory';

describe('Auth e2e - identity/auth', () => {
  let app: INestApplication;
  let userAdmin;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  // beforeEach(async () => {
  //   userAdmin = await UserFactory.;
  // });

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
