import { SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { Session as SessionORM } from '../entites/sessions.orm-entity';
import { SeederContext } from '../../../../../../shared/database/seeders/config/context';
import { SeederTask } from '../../../../../../shared/database/seeders/config/types';
import { sessionFactoryData } from '../factory/session.factory';
import { SEEDED_ADMIN, SEEDED_MEMBER } from '../../../../../../../test/factories/user.factory';
import {
  buildSessionEntity,
  SECOND_SESSION_ID,
} from '../../../../../../../test/factories/session.factory';

export default class SessionSeeder implements SeederTask {
  tag = ['users', 'auth', 'sessions'];
  private dataSource: DataSource;
  private factoryManager?: SeederFactoryManager | undefined;

  constructor(
    private readonly ctx: SeederContext,
    private howMuchSessionsPerUser: number = 1,
    private usersId: string[] = [],
  ) {
    this.dataSource = this.ctx.dataSource;
    this.factoryManager = this.ctx.factoryManager || undefined;
  }

  async run(): Promise<void> {
    if (!this.factoryManager) throw new Error('SeederFactoryManager is required');

    const sessionRepo = this.dataSource.getRepository(SessionORM);
    const sessionFactory = this.factoryManager.get(SessionORM);

    await Promise.all([
      sessionRepo.save(sessionFactoryData(SEEDED_ADMIN.id, true)),
      ...this.usersId.map((id) => {
        return sessionFactory.saveMany(this.howMuchSessionsPerUser ?? 1, {
          userId: id,
        });
      }),
    ]);
  }

  async runForTests(): Promise<void> {
    const sessionRepo = this.dataSource.getRepository(SessionORM);
    const admin = sessionRepo.create(buildSessionEntity({ userId: SEEDED_ADMIN.id }));
    const member = sessionRepo.create(
      buildSessionEntity({ id: SECOND_SESSION_ID, userId: SEEDED_MEMBER.id }),
    );
    await sessionRepo.save([admin, member]);
  }
}
