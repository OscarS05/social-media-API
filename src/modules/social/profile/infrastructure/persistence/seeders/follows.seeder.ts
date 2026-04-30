import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { Profiles as ProfilesORM } from '../entities/profiles.orm-entity';
import { profileFactoryData } from '../factory/profile.factory';

export default class ProfilesSeeder implements Seeder {
  constructor(
    private adminId: string,
    private usersId: string[],
    private readonly dataSource: DataSource,
    private readonly factoryManager?: SeederFactoryManager,
  ) {}

  async run(): Promise<void> {
    if (!this.factoryManager) throw new Error('SeederFactoryManager is required');

    const profileRepo = this.dataSource.getRepository(ProfilesORM);
    const profileFactory = this.factoryManager.get(ProfilesORM);

    await profileRepo.save(profileFactoryData(this.adminId));
    await Promise.all(
      this.usersId.map((id) => {
        return profileFactory.saveMany(1, {
          userId: id,
        });
      }),
    );
  }

  async runTestSeeders(): Promise<void> {
    // const profileRepo = this.dataSource.getRepository(ProfilesORM);
    // return {
    //   profiles: await profileRepo.save([
    //     profileFactoryData(this.adminId),
    //     ...this.usersId.map((id) => profileFactoryData(id)),
    //   ]),
    // };
  }
}
