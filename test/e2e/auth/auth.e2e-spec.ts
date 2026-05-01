import { Server } from 'node:http';
import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import request, { Response } from 'supertest';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { createTestApp } from '../app.e2e';
import MainSeeder from '../../../src/shared/database/seeders/app.seeder';
import { User as UserORM } from '../../../src/modules/auth/infrastructure/persistence/db/entites/user.orm-entity';
import {
  EMAIL,
  EMAIL_OAUTH_GOOGLE,
  NAME,
  PASSWORD_PLAIN,
  SEEDED_ADMIN,
  SEEDED_MEMBER,
} from '../../factories/user.factory';
import { ANOTHER_RAW_USER_AGENT, RAW_USER_AGENT } from '../../factories/session.factory';
import {
  LoginResponse,
  PayloadAccessToken,
  PayloadRefreshToken,
} from '../../../src/modules/auth/domain/types/session';
import { Session as SessionORM } from '../../../src/modules/auth/infrastructure/persistence/db/entites/sessions.orm-entity';
import { Roles } from '../../../src/modules/auth/domain/enums/roles.enum';
import { TokenDto } from '../../../src/modules/auth/infrastructure/dtos/auth.dto';
import { SessionResponseDto } from '../../../src/modules/auth/infrastructure/dtos/session.dto';

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
    await new MainSeeder().runTestSeeders(dataSource, ['users', 'sessions']);

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

  describe('PUT /auth/refresh', () => {
    let loginRes: Response;
    let accessToken: string;
    let refreshToken: string;

    beforeAll(async () => {
      loginRes = await request(server)
        .post('/auth/login')
        .set('user-agent', RAW_USER_AGENT)
        .send({ email: SEEDED_MEMBER.email, password: SEEDED_MEMBER.password });

      accessToken = (loginRes.body as TokenDto).accessToken;
      refreshToken = loginRes.headers['set-cookie'][0].split(';')[0].split('=')[1];
    });

    it('401 with invalid refresh token', async () => {
      await request(server)
        .put('/auth/refresh')
        .set('user-agent', RAW_USER_AGENT)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=invalidToken`)
        .expect(401);
    });

    it('401 with expired refresh token', async () => {
      const expiredRefreshToken = jwtService.sign(
        { sub: SEEDED_MEMBER.id, version: 1 },
        { expiresIn: '-1h', secret: process.env.REFRESH_SECRET },
      );

      await request(server)
        .put('/auth/refresh')
        .set('user-agent', RAW_USER_AGENT)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${expiredRefreshToken}`)
        .expect(401);
    });

    it('401 with invalid user agent', async () => {
      await request(server)
        .put('/auth/refresh')
        .set('user-agent', ANOTHER_RAW_USER_AGENT)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(401);
    });

    it('returns tokens successsfully', async () => {
      // INIT SESSION
      const loginRes = await request(server)
        .post('/auth/login')
        .set('user-agent', RAW_USER_AGENT)
        .send({ email: SEEDED_MEMBER.email, password: SEEDED_MEMBER.password });

      const accessToken = (loginRes.body as TokenDto).accessToken;
      const refreshToken = loginRes.headers['set-cookie'][0].split(';')[0].split('=')[1];

      // REFRESH SESSION
      const res = await request(server)
        .put('/auth/refresh')
        .set('user-agent', RAW_USER_AGENT)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      const body = res.body as TokenDto;
      const decoded: PayloadAccessToken = jwtService.decode(body.accessToken);
      expect(decoded?.sub).toBe(SEEDED_MEMBER.id);
      expect(decoded?.role).toBe(SEEDED_MEMBER.role);

      const decodedRefresh: PayloadRefreshToken = jwtService.decode(
        res.headers['set-cookie'][0].split(';')[0].split('=')[1],
      );
      expect(decodedRefresh).toHaveProperty('sub');
      expect(decodedRefresh?.version).toBe(2); // 2nd session
    });

    // TEST WITH ANOTHER USER
    it('401 with invalid refresh token by previous version', async () => {
      const firstSession = await request(server)
        .post('/auth/login')
        .set('user-agent', RAW_USER_AGENT)
        .send({ email: SEEDED_ADMIN.email, password: SEEDED_ADMIN.password });

      const accessTokenFirstSession = (firstSession.body as TokenDto).accessToken;
      const refreshTokenFirstSession = firstSession.headers['set-cookie'][0]
        .split(';')[0]
        .split('=')[1];

      const seccondSession = await request(server)
        .put('/auth/refresh')
        .set('user-agent', RAW_USER_AGENT)
        .set('Authorization', `Bearer ${accessTokenFirstSession}`)
        .set('Cookie', `refreshToken=${refreshTokenFirstSession}`)
        .expect(200);

      const accessTokenSecondSession = (seccondSession.body as TokenDto).accessToken;

      await request(server)
        .put('/auth/refresh')
        .set('user-agent', RAW_USER_AGENT)
        .set('Authorization', `Bearer ${accessTokenSecondSession}`)
        .set('Cookie', `refreshToken=${refreshTokenFirstSession}`)
        .expect(401);
    });
  });

  describe('DELETE /auth/sessions/current', () => {
    it('204 if the logout was successful', async () => {
      const responseLogin = await request(server)
        .post('/auth/login')
        .set('user-agent', RAW_USER_AGENT)
        .send({ email: SEEDED_MEMBER.email, password: SEEDED_MEMBER.password });

      const accessToken = (responseLogin.body as TokenDto).accessToken;
      const refreshToken = responseLogin.headers['set-cookie'][0].split(';')[0].split('=')[1];

      await request(server)
        .delete('/auth/sessions/current')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(204);

      const { jti }: PayloadRefreshToken = jwtService.decode(refreshToken);
      const session = await sessionRepo.findOne({ where: { id: jti, revoked: true } });
      expect(session).toBeDefined();
    });

    it('401 when trying to refresh with revoked session', async () => {
      const responseLogin = await request(server)
        .post('/auth/login')
        .set('user-agent', RAW_USER_AGENT)
        .send({ email: SEEDED_MEMBER.email, password: SEEDED_MEMBER.password });

      const accessToken = (responseLogin.body as TokenDto).accessToken;
      const refreshToken = responseLogin.headers['set-cookie'][0].split(';')[0].split('=')[1];

      await request(server)
        .delete('/auth/sessions/current')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(204);

      // Check if the revoked session works
      await request(server)
        .put('/auth/refresh')
        .set('user-agent', RAW_USER_AGENT)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(404);
    });

    it('401 without token', async () => {
      const responseLogin = await request(server)
        .post('/auth/login')
        .set('user-agent', RAW_USER_AGENT)
        .send({ email: SEEDED_MEMBER.email, password: SEEDED_MEMBER.password });

      const accessToken = (responseLogin.body as TokenDto).accessToken;

      await request(server)
        .delete('/auth/sessions/current')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${accessToken}`)
        .expect(401);
    });
  });

  describe('GET /auth/sessions', () => {
    let accessToken: string;

    beforeAll(async () => {
      const responseLogin = await request(server)
        .post('/auth/login')
        .set('user-agent', RAW_USER_AGENT)
        .send({ email: SEEDED_ADMIN.email, password: SEEDED_ADMIN.password });

      accessToken = (responseLogin.body as TokenDto).accessToken;
    });

    it('200 with a list of sessions', async () => {
      const response = await request(server)
        .get('/auth/sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      const sessions = response.body as SessionResponseDto[];

      expect(sessions.length).toBeGreaterThanOrEqual(1);
      expect(sessions[0].id).toBeDefined();
      expect(sessions[0].createdAt).toBeDefined();
      expect(sessions[0].expiresAt).toBeDefined();
      expect(sessions[0].device).toBeDefined();
      expect(sessions[0].os).toBeDefined();
      expect(sessions[0].browser).toBeDefined();
      expect(sessions[0].ipAddress).toBeDefined();
    });

    it('401 with invalid token', async () => {
      await request(server)
        .get('/auth/sessions')
        .set('Authorization', `Bearer invalidToken`)
        .expect(401);
    });
  });

  describe('DELETE /auth/sessions', () => {
    let accessToken: string;

    beforeAll(async () => {
      const responseLogin = await request(server)
        .post('/auth/login')
        .set('user-agent', RAW_USER_AGENT)
        .send({ email: SEEDED_ADMIN.email, password: SEEDED_ADMIN.password });

      accessToken = (responseLogin.body as TokenDto).accessToken;
    });

    it('200 with a list of sessions', async () => {
      const response = await request(server)
        .get('/auth/sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      const sessions = response.body as SessionResponseDto[];

      expect(sessions.length).toBeGreaterThanOrEqual(1);
      expect(sessions[0].id).toBeDefined();
      expect(sessions[0].createdAt).toBeDefined();
      expect(sessions[0].expiresAt).toBeDefined();
      expect(sessions[0].device).toBeDefined();
      expect(sessions[0].os).toBeDefined();
      expect(sessions[0].browser).toBeDefined();
      expect(sessions[0].ipAddress).toBeDefined();
    });

    it('401 with invalid token', async () => {
      await request(server)
        .get('/auth/sessions')
        .set('Authorization', `Bearer invalidToken`)
        .expect(401);
    });
  });

  describe('DELETE /auth/sessions/:id', () => {
    let refreshToken: string;
    let accessToken: string;

    beforeAll(async () => {
      await sessionRepo.update({ userId: SEEDED_ADMIN.id }, { revoked: true });

      // 2 sessions
      const responseLogin = await request(server)
        .post('/auth/login')
        .set('user-agent', RAW_USER_AGENT)
        .send({ email: SEEDED_ADMIN.email, password: SEEDED_ADMIN.password });
      accessToken = (responseLogin.body as TokenDto).accessToken;
      refreshToken = responseLogin.headers['set-cookie'][0].split(';')[0].split('=')[1];

      await request(server)
        .post('/auth/login')
        .set('user-agent', RAW_USER_AGENT)
        .send({ email: SEEDED_ADMIN.email, password: SEEDED_ADMIN.password });
    });

    it('204 with that session closed', async () => {
      const { jti, sub }: PayloadRefreshToken = jwtService.decode(refreshToken);

      await request(server)
        .delete(`/auth/sessions/${jti}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      const sessions = await sessionRepo.find({ where: { userId: sub, revoked: false } });
      expect(sessions.length).toBe(1);
    });

    it('401 with invalid token', async () => {
      await request(server)
        .get('/auth/sessions')
        .set('Authorization', `Bearer invalidToken`)
        .expect(401);
    });
  });
});
