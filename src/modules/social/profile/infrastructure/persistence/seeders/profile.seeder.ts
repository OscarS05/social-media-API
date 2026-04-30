import { profileFactoryData } from '../factory/profile.factory';
import { SeederContext } from '../../../../../../shared/database/seeders/config/context';
import { SeederTask } from '../../../../../../shared/database/seeders/config/types';
import {
  SEEDED_ADMIN,
  SEEDED_MEMBER,
} from '../../../../../auth/infrastructure/persistence/db/factory/user.factory';
import { Profiles as ProfilesORM } from '../entities/profiles.orm-entity';
import { DataSource } from 'typeorm';
import { SeederFactoryManager } from 'typeorm-extension';

export default class ProfileSeeder implements SeederTask {
  tag: string[] = ['users', 'session', 'profile'];
  private dataSource: DataSource;
  private factoryManager?: SeederFactoryManager | undefined;

  constructor(
    private readonly ctx: SeederContext,
    private readonly usersId: string[] = [],
  ) {
    this.dataSource = this.ctx.dataSource;
    this.factoryManager = this.ctx.factoryManager || undefined;
  }

  async run(): Promise<void> {
    if (!this.factoryManager) throw new Error('SeederFactoryManager is required');

    const profileRepo = this.dataSource.getRepository(ProfilesORM);
    const profileFactory = this.factoryManager.get(ProfilesORM);
    await Promise.all([
      profileRepo.save(profileFactoryData(SEEDED_ADMIN.id, true)),
      ...this.usersId.map((id) =>
        profileFactory.saveMany(1, {
          userId: id,
        }),
      ),
    ]);
  }

  async runForTests(): Promise<void> {
    const profileRepo = this.dataSource.getRepository(ProfilesORM);

    await profileRepo.save([
      profileFactoryData(SEEDED_ADMIN.id, true),
      profileFactoryData(SEEDED_MEMBER.id, false),
    ]);
  }
}
