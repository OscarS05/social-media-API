import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import UserSeeder from './user.seeder';
import AuthSeeder from './auth.seeder';

export default class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const { adminUser, usersSaved } = await new UserSeeder().run(
      dataSource,
      factoryManager,
    );

    await new AuthSeeder(adminUser, usersSaved, 1).run(dataSource, factoryManager);
  }

  public async runTests(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
    howMuchUsers: number = 1,
    howMuchAuthxUser: number = 1,
  ): Promise<void> {
    const { adminUser, usersSaved } = await new UserSeeder(howMuchUsers).run(
      dataSource,
      factoryManager,
    );

    await new AuthSeeder(adminUser, usersSaved, howMuchAuthxUser).run(
      dataSource,
      factoryManager,
    );
  }
}
