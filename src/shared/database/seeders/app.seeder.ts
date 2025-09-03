import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import UserSeeder from './user.seeder';
import AuthSeeder from './auth.seeder';
import { User } from '../../../../src/modules/identity/users/infrastructure/persistence/db/entities/user.orm-entity';
import { Auth } from '../../../../src/modules/identity/auth/infrastructure/persistence/db/entites/auth.orm-entity';

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

  public async runTestSeeders(
    dataSource: DataSource,
    howMuchUsers: number = 1,
    howMuchAuthxUser: number = 1,
  ): Promise<{ adminUser: User; authAdmin: Auth }> {
    const { adminUser, usersSaved } = await new UserSeeder(howMuchUsers).runTestSeeders(
      dataSource,
    );

    const authAdmin = await new AuthSeeder(
      adminUser,
      usersSaved,
      howMuchAuthxUser,
    ).runTestSeeders(dataSource);

    return { adminUser, authAdmin };
  }
}
