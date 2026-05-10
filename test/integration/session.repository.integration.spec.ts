import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';

import { SessionRepositoryORM } from '../../src/modules/auth/infrastructure/persistence/db/repositories/session.repository';
import { Session as SessionORM } from '../../src/modules/auth/infrastructure/persistence/db/entites/sessions.orm-entity';
import MainSeeder from '../../src/shared/database/seeders/app.seeder';
import { SeedersTag } from '../../src/shared/database/seeders/config/types';
import { typeOrmConfig } from '../../src/shared/database/config/typeorm.config';
import { buildSessionEntity } from '../factories/session.factory';
import { MEMBER_ID } from '../factories/user.factory';

describe('UserRepository (integration)', () => {
  let dataSource: DataSource;
  let sessionRepoInstance: Repository<SessionORM>;
  let sessionRepo: SessionRepositoryORM;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(typeOrmConfig), TypeOrmModule.forFeature([SessionORM])],
      providers: [SessionRepositoryORM],
    }).compile();

    dataSource = module.get(DataSource);
    sessionRepo = module.get(SessionRepositoryORM);
    sessionRepoInstance = dataSource.getRepository(SessionORM);

    await dataSource.dropDatabase();
    await dataSource.runMigrations();

    await new MainSeeder().runTestSeeders(dataSource, [SeedersTag.USERS, SeedersTag.SESSIONS]);
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
  });

  describe('.create()', () => {
    const newSessionIds = new Set<string>();

    afterAll(async () => {
      await sessionRepoInstance.delete(Array.from(newSessionIds));
    });

    it('should create a session successfully', async () => {
      const id = '66a64924-8f16-4ac6-b0fe-d1f736d9af41';
      const session = buildSessionEntity({ userId: MEMBER_ID, id });
      const newProfile = await sessionRepo.create(session);

      expect(newProfile.id).toBe(session.id);
      expect(newProfile.userId).toBe(session.userId);
      expect(newProfile.tokenHashed).toBe(session.tokenHashed);
      expect(newProfile.userAgent).toBe(session.userAgent);
      expect(newProfile.ipAddress).toBe(session.ipAddress);
      expect(newProfile.version).toBe(session.version);
      expect(newProfile.expiresAt.toISOString()).toBe(session.expiresAt.toISOString());
      expect(newProfile.createdAt.toISOString()).toBe(newProfile.createdAt.toISOString());
      expect(newProfile.updatedAt.toISOString()).toBe(newProfile.updatedAt.toISOString());

      newSessionIds.add(newProfile.id);
    });
  });

  describe('updates', () => {
    afterAll(async () => {
      await sessionRepoInstance.deleteAll();
      await new MainSeeder().runTestSeeders(dataSource, [SeedersTag.SESSIONS]);
    });

    describe('.update()', () => {
      it('should update a session successfully', async () => {
        const sessionInDb = await sessionRepoInstance.findOne({
          where: { userId: MEMBER_ID },
        });
        const newUpdatedAt = new Date(new Date().getTime() + 1);
        const session = buildSessionEntity({
          ...sessionInDb,
          version: 10,
          updatedAt: newUpdatedAt,
        });
        const updatedExecuted = await sessionRepo.update(session.id, session);
        const updatedSession = await sessionRepoInstance.findOne({
          where: { id: session.id },
        });

        expect(updatedExecuted).toBeUndefined();
        expect(updatedSession?.id).toBe(session.id);
        expect(updatedSession?.version).not.toBe(sessionInDb?.version);
        expect(updatedSession?.version).toBe(session.version);
        expect(updatedSession?.expiresAt.getTime()).toBeGreaterThanOrEqual(
          session?.expiresAt.getTime() || 0,
        );
        expect(updatedSession?.updatedAt.getTime()).toBeGreaterThanOrEqual(
          sessionInDb?.updatedAt.getTime() || 0,
        );
      });
    });

    describe('.updateByUserId()', () => {
      it('should update a session by userId successfully', async () => {
        const newUpdatedAt = new Date(new Date().getTime() + 1);
        const updatedExecuted = await sessionRepo.updateByUserId(MEMBER_ID, {
          revoked: true,
          updatedAt: newUpdatedAt,
        });
        const updatedSessions = await sessionRepoInstance.find({
          where: { userId: MEMBER_ID },
        });

        expect(updatedExecuted).toBeUndefined();
        expect(updatedSessions.some((s) => s.revoked == false)).toBeFalsy();
      });
    });
  });

  describe('.findByIdAndUserId()', () => {
    it('should not find a session', async () => {
      const result = await sessionRepo.findByIdAndUserId('uuid', MEMBER_ID);
      expect(result).toBeNull();
    });

    it('should find a session successfully', async () => {
      const session = await sessionRepoInstance.findOne({ where: { userId: MEMBER_ID } });
      const result = await sessionRepo.findByIdAndUserId(session?.id || '', MEMBER_ID);
      expect(result?.id).toBe(session?.id);
      expect(result?.userId).toBe(MEMBER_ID);
    });
  });

  describe('.findAllByUserId()', () => {
    it('should not find any session', async () => {
      const result = await sessionRepo.findAllByUserId('uuid-unknown');
      expect(result.length).toBe(0);
    });

    it('should return a list of sessions successfully', async () => {
      const result = await sessionRepo.findAllByUserId(MEMBER_ID);
      expect(result.length).toBe(1); // One session per user in test seeders
    });
  });
});
