/**
POST /auth/refresh
  ✓ 200 con refresh token válido → retorna nuevo accessToken
  ✓ 401 con refresh token expirado o inválido

POST /auth/logout
  ✓ 200 revoca la sesión correctamente
  ✓ 401 sin token

GET /auth/sessions
  ✓ 200 retorna lista de sesiones activas

PUT /auth/revoke
PUT /auth/revoke/id
*/

import { Server } from 'node:http';
import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { createTestApp } from '../app.e2e';
import MainSeeder from '../../../src/shared/database/seeders/app.seeder';
import { User as UserORM } from '../../../src/modules/auth/infrastructure/persistence/db/entites/user.orm-entity';
import { EMAIL, EMAIL_OAUTH_GOOGLE, NAME, PASSWORD_PLAIN } from '../../factories/user.factory';
import {
  SEEDED_ADMIN,
  SEEDED_MEMBER,
} from '../../../src/shared/database/factories/user.factory';
import { RAW_USER_AGENT } from '../../factories/session.factory';
import {
  LoginResponse,
  PayloadAccessToken,
  PayloadRefreshToken,
} from '../../../src/modules/auth/domain/types/session';
import { Session as SessionORM } from '../../../src/modules/auth/infrastructure/persistence/db/entites/sessions.orm-entity';
import { Roles } from '../../../src/modules/auth/domain/enums/roles.enum';

describe('Auth e2e - identity/auth', () => {
  let app: INestApplication;
  let server: Server;
  let dataSource: DataSource;
  let userRepo: Repository<UserORM>;
  let sessionRepo: Repository<SessionORM>;
  const jwtService = new JwtService();

  const userLogin = {
    email: EMAIL,
    password: PASSWORD_PLAIN,
  };

  const userData = {
    ...userLogin,
    name: NAME,
  };

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer() as Server;
    dataSource = app.get(DataSource);
    await dataSource.dropDatabase();
    await dataSource.runMigrations();
    await new MainSeeder().runTestSeeders(dataSource);

    userRepo = dataSource.getRepository(UserORM);
    sessionRepo = dataSource.getRepository(SessionORM);
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('returns a new user with 201', async () => {
      const res = await request(server).post('/auth/register').send(userData).expect(201);

      const user = await userRepo.findOne({ where: { email: userData.email } });

      expect(res.body).toHaveProperty('email');
      expect(res.body).toHaveProperty('name');

      expect(user).toBeTruthy();
      expect(user?.password).not.toBe(userData.password);
      const isValid = await bcrypt.compare(userData.password, user?.password ?? '');
      expect(isValid).toBe(true);
    });

    it('400 with wrong name', async () => {
      await request(server)
        .post('/auth/register')
        .send({ name: 'te', email: userData.email, password: 'password' })
        .expect(400);
    });

    it('409 with already registered email', async () => {
      await request(server)
        .post('/auth/register')
        .send({ ...userData, email: SEEDED_ADMIN.email })
        .expect(409);
    });

    it('400 with weak password', async () => {
      await request(server)
        .post('/auth/register')
        .send({ ...userData, email: 'test2@test.com', password: 'password' })
        .expect(400);
    });

    it('400 with missing fields', async () => {
      await request(server)
        .post('/auth/register')
        .send({ email: userData.email, password: userData.password })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('returns user and tokens successfully', async () => {
      const res = await request(server)
        .post('/auth/login')
        .set('user-agent', RAW_USER_AGENT)
        .send({ email: SEEDED_MEMBER.email, password: SEEDED_MEMBER.password })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      const body = res.body as LoginResponse;
      const decoded: PayloadAccessToken = jwtService.decode(body.accessToken);
      expect(decoded).toHaveProperty('sub');
      expect(decoded).toHaveProperty('role');
      expect(decoded.sub).toBe(SEEDED_MEMBER.id);
      expect(decoded.role).toBe(SEEDED_MEMBER.role);
      expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=/);

      const refreshToken = res.headers['set-cookie'][0].split(';')[0].split('=')[1];
      const decodedRefresh: PayloadRefreshToken = jwtService.decode(refreshToken);
      expect(decodedRefresh).toHaveProperty('sub');
      expect(decodedRefresh).toHaveProperty('version');
      expect(decodedRefresh.sub).toBe(SEEDED_MEMBER.id);
      expect(decodedRefresh.version).toBe(1);

      expect(body.user).toHaveProperty('email');
      expect(body.user).toHaveProperty('name');
      expect(body.user).toHaveProperty('role');
      expect(body.user.email).toBe(SEEDED_MEMBER.email);
      expect(body.user.name).toBe(SEEDED_MEMBER.name);
      expect(body.user.role).toBe(SEEDED_MEMBER.role);

      const session = await sessionRepo.findOne({
        where: { userId: SEEDED_MEMBER.id },
      });
      if (!session) throw new Error('Session is required');

      expect(session.expiresAt.getTime()).toBeGreaterThanOrEqual(new Date().getTime() + 86400);
      expect(bcrypt.compare(refreshToken, session.tokenHashed)).toBeTruthy();
    });

    it('401 with wrong password', async () => {
      await request(server)
        .post('/auth/login')
        .set('user-agent', RAW_USER_AGENT)
        .send({ email: SEEDED_ADMIN.email, password: 'Incorrect123@' })
        .expect(401);
    });

    it('401 with wrong email', async () => {
      await request(server)
        .post('/auth/login')
        .set('user-agent', RAW_USER_AGENT)
        .send({ ...userLogin, email: 'no-registered@example.com' })
        .expect(401);
    });

    it('403 with user not verified', async () => {
      await userRepo.update(SEEDED_MEMBER.id, { isVerified: false });
      await request(server)
        .post('/auth/login')
        .set('user-agent', RAW_USER_AGENT)
        .send({ email: SEEDED_MEMBER.email, password: SEEDED_MEMBER.password })
        .expect(403);
      await userRepo.update(SEEDED_MEMBER.id, { isVerified: true });
    });
  });

  describe('Google strategy', () => {
    let userId: string;

    it('(GET) /auth/google should redirect (302)', async () => {
      return request(server).get('/auth/google').expect(302);
    });

    // First login using MockGoogleStrategy it should create the user
    it('(GET) /auth/google/callback should register', async () => {
      const response = await request(server)
        .get('/auth/google/callback')
        .set('user-agent', RAW_USER_AGENT)
        .expect(200);

      const body = response.body as LoginResponse;

      expect(body.user.email).toBe(EMAIL_OAUTH_GOOGLE);
      expect(body.user.role).toBe(Roles.MEMBER);
      expect(body.accessToken).toBeTruthy();

      const refreshToken = response.headers['set-cookie'][0].split(';')[0].split('=')[1];
      const decodedRefresh: PayloadRefreshToken = jwtService.decode(refreshToken);
      expect(decodedRefresh).toHaveProperty('sub');
      expect(decodedRefresh).toHaveProperty('version');
      expect(decodedRefresh.version).toBe(1);
      userId = decodedRefresh.sub;
      const sessions = await sessionRepo.find({
        where: { userId },
      });

      expect(sessions.length).toBe(1);
      const session = sessions[0];
      expect(session.expiresAt.getTime()).toBeGreaterThanOrEqual(new Date().getTime() + 86400);
      expect(bcrypt.compare(refreshToken, session.tokenHashed)).toBeTruthy();
    });

    // Second login using MockGoogleStrategy it should login the user
    it('(GET) /auth/google/callback should login', async () => {
      const response = await request(server)
        .get('/auth/google/callback')
        .set('user-agent', RAW_USER_AGENT)
        .expect(200);

      const body = response.body as LoginResponse;

      // This id should be the same as in the last test becuase it is only a login, not another registration
      expect(body.user.id).toBe(userId);
      expect(body.user.email).toBe(EMAIL_OAUTH_GOOGLE);
      expect(body.accessToken).toBeTruthy();

      const refreshToken = response.headers['set-cookie'][0].split(';')[0].split('=')[1];
      const decodedRefresh: PayloadRefreshToken = jwtService.decode(refreshToken);
      expect(decodedRefresh.version).toBe(1);
      const sessions = await sessionRepo.find({
        where: { userId },
      });

      expect(sessions.length).toBe(2);
      const matchingSessions = sessions.filter((session) => session.id === decodedRefresh.jti);
      expect(matchingSessions.length).toBe(1);

      const session = matchingSessions[0];
      expect(session.expiresAt.getTime()).toBeGreaterThanOrEqual(new Date().getTime() + 86400);
      expect(bcrypt.compare(refreshToken, session.tokenHashed)).toBeTruthy();
    });
  });
});
