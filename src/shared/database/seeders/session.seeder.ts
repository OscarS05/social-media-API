import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { User as UserORM } from '../../../modules/auth/infrastructure/persistence/db/entites/user.orm-entity';
import { Session as SessionORM } from '../../../modules/auth/infrastructure/persistence/db/entites/sessions.orm-entity';
import { sessionFactoryData } from '../factories/session.factory';

export default class SessionSeeder implements Seeder {
  constructor(
    private admin: UserORM,
    private users: UserORM[],
    private howMuchSessionsPerUser: number,
    private readonly dataSource: DataSource,
    private readonly factoryManager?: SeederFactoryManager,
  ) {}

  async run(): Promise<void> {
    if (!this.factoryManager) throw new Error('SeederFactoryManager is required');

    const sessionRepo = this.dataSource.getRepository(SessionORM);
    const sessionFactory = this.factoryManager.get(SessionORM);

    await sessionRepo.save(sessionFactoryData(this.admin.id, true));
    await Promise.all(
      this.users.map((user) => {
        return sessionFactory.saveMany(this.howMuchSessionsPerUser ?? 1, {
          userId: user.id,
        });
      }),
    );
  }

  async runTestSeeders(): Promise<{ sessions: SessionORM[] }> {
    const sessionRepo = this.dataSource.getRepository(SessionORM);

    return {
      sessions: await sessionRepo.save([
        sessionFactoryData(this.admin.id, true),
        ...this.users.map((user) => sessionFactoryData(user.id, true)),
      ]),
    };
  }
}
