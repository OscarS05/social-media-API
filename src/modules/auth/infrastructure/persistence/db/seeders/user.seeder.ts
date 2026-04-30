import { SeederFactoryManager } from 'typeorm-extension';
import { DataSource, Repository } from 'typeorm';

import { User as UserORM } from '../entites/user.orm-entity';
import { SeederContext } from '../../../../../../shared/database/seeders/config/context';
import { SEEDED_ADMIN, SEEDED_MEMBER } from '../factory/user.factory';
import { SeederTask } from '../../../../../../shared/database/seeders/config/types';

export default class UserSeeder implements SeederTask {
  tag = ['users', 'auth'];
  private dataSource: DataSource;
  private factoryManager?: SeederFactoryManager | undefined;

  constructor(
    private readonly ctx: SeederContext,
    private howMuchUsers: number = 10,
  ) {
    this.dataSource = this.ctx.dataSource;
    this.factoryManager = this.ctx.factoryManager || undefined;
  }

  // To local development — use faker with factoryManager
  async run(): Promise<string[]> {
    if (!this.factoryManager) throw new Error('FactoryManager is required to run seeders');

    const userRepository = this.dataSource.getRepository(UserORM);
    const userFactory = this.factoryManager.get(UserORM);

    const response = await Promise.all([
      userRepository.save(this.buildFromConstants(userRepository, SEEDED_ADMIN)),
      userFactory.saveMany(this.howMuchUsers),
    ]);

    return response[1].map((user) => user.id);
  }

  // For tests e2e — predictable data, without faker
  async runForTests(): Promise<void> {
    const userRepository = this.dataSource.getRepository(UserORM);

    await userRepository.save([
      this.buildFromConstants(userRepository, SEEDED_ADMIN),
      this.buildFromConstants(userRepository, SEEDED_MEMBER),
    ]);
  }

  private buildFromConstants(
    userRepository: Repository<UserORM>,
    data: typeof SEEDED_ADMIN | typeof SEEDED_MEMBER,
  ): UserORM {
    return userRepository.create({
      id: data.id,
      name: data.name,
      role: data.role,
      email: data.email,
      password: data.passwordHashed,
      provider: data.provider,
      providerId: null,
      resetToken: null,
      isVerified: data.isVerified,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
  }
}
