import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import UserSeeder from './user.seeder';
import SessionSeeder from './session.seeder';
import { User as UserORM } from '../../../modules/auth/infrastructure/persistence/db/entites/user.orm-entity';
import { SEEDED_ADMIN, SEEDED_MEMBER } from '../factories/user.factory';

export default class MainSeeder implements Seeder {
  constructor() {}

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const { admin, users } = await new UserSeeder(dataSource, factoryManager).run();
    await new SessionSeeder(admin, users, 3, dataSource, factoryManager).run();
  }

  public async runTestSeeders(dataSource: DataSource): Promise<void> {
    await new UserSeeder(dataSource).runTestSeeders();
    await new SessionSeeder(
      SEEDED_ADMIN as unknown as UserORM,
      [SEEDED_MEMBER as unknown as UserORM],
      2,
      dataSource,
    ).runTestSeeders();
  }
}
