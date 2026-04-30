import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import UserSeeder from '../../../modules/auth/infrastructure/persistence/db/seeders/user.seeder';
import SessionSeeder from '../../../modules/auth/infrastructure/persistence/db/seeders/session.seeder';
import { SeederContext } from './config/context';
import ProfileSeeder from '../../../modules/social/profile/infrastructure/persistence/seeders/profile.seeder';

export default class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const ctx = new SeederContext(dataSource, factoryManager);

    const usersId = await new UserSeeder(ctx).run();
    await new SessionSeeder(ctx, 3, usersId).run();
    await new ProfileSeeder(ctx, usersId).run();
  }

  public async runTestSeeders(dataSource: DataSource, tags: string[]): Promise<void> {
    const ctx = new SeederContext(dataSource);

    const allSeeders = [UserSeeder, SessionSeeder, ProfileSeeder];

    const seedersList = allSeeders
      .map((S) => new S(ctx))
      .filter((seeder) => tags.some((tag) => seeder.tag.includes(tag)));

    for (const seeder of seedersList) {
      await seeder.runForTests();
    }
  }
}
