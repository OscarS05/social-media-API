import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';

import { UserRepositoryORM } from '../../src/modules/auth/infrastructure/persistence/db/repositories/user.repository';
import { User as UserORM } from '../../src/modules/auth/infrastructure/persistence/db/entites/user.orm-entity';
import MainSeeder from '../../src/shared/database/seeders/app.seeder';
import { SeedersTag } from '../../src/shared/database/seeders/config/types';
import { typeOrmConfig } from '../../src/shared/database/config/typeorm.config';
import { buildUserEntity, SEEDED_MEMBER } from '../factories/user.factory';
import { AuthProvider } from '../../src/modules/auth/domain/enums/providers.enum';

describe('UserRepository (integration)', () => {
  let dataSource: DataSource;
  let userRepoInstance: Repository<UserORM>;
  let userRepo: UserRepositoryORM;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(typeOrmConfig), TypeOrmModule.forFeature([UserORM])],
      providers: [UserRepositoryORM],
    }).compile();

    dataSource = module.get(DataSource);
    userRepo = module.get(UserRepositoryORM);
    userRepoInstance = dataSource.getRepository(UserORM);

    await dataSource.dropDatabase();
    await dataSource.runMigrations();

    await new MainSeeder().runTestSeeders(dataSource, [SeedersTag.USERS]);
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
  });

  describe('.createUser()', () => {
    afterAll(async () => {
      await userRepoInstance.deleteAll();
      await new MainSeeder().runTestSeeders(dataSource, [SeedersTag.USERS]);
    });

    it('should create a user successfully', async () => {
      const id = '66a64924-8f16-4ac6-b0fe-d1f736d9af41';
      const profile = buildUserEntity({ id: id, email: 'random@email.com' });
      const newProfile = await userRepo.createUser(profile);
      expect(newProfile).toMatchObject(profile.toBasic());
    });

    it('should fail if email is duplicated', async () => {
      const id = '96a64924-8f16-4ac6-b0fe-d1f736d9af41';
      const profile = buildUserEntity({ id: id, email: 'random@email.com' });
      // TODO: Coloca dentro del .toThrow algo para que valide si el mensaje de error contiene la palabta unique, para verificar que falla por que ya hay un usuario con ese mismo email
      await expect(userRepo.createUser(profile)).rejects.toThrow(/Duplicate entry/i);
    });
  });

  describe('.findByProviderId()', () => {
    it('should not find a user with local provider', async () => {
      const result = await userRepo.findByProviderId(SEEDED_MEMBER.provider, '');
      expect(result).toBeNull();
    });

    it('should find a user with google provider successfully', async () => {
      await userRepoInstance.update(
        { id: SEEDED_MEMBER.id },
        { provider: AuthProvider.GOOGLE, providerId: '123456' },
      );

      const result = await userRepo.findByProviderId(AuthProvider.GOOGLE, '123456');
      expect(result?.id).toBe(SEEDED_MEMBER.id);

      await userRepoInstance.update(
        { id: SEEDED_MEMBER.id },
        { provider: AuthProvider.LOCAL, providerId: null },
      );
    });
  });

  describe('.findByEmail()', () => {
    it('should find the user successfully', async () => {
      const result = await userRepo.findByEmail(SEEDED_MEMBER.email);
      expect(result?.id).toBe(SEEDED_MEMBER.id);
    });

    it('should not find the user', async () => {
      const result = await userRepo.findByEmail('not-created@email.com');
      expect(result).toBeNull();
    });
  });
});
