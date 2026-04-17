import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource, Repository } from 'typeorm';

import { User as UserORM } from '../../../modules/auth/infrastructure/persistence/db/entites/user.orm-entity';
import { SEEDED_ADMIN, SEEDED_MEMBER } from '../factories/user.factory';

export default class UserSeeder implements Seeder {
  constructor(
    private readonly dataSource: DataSource,
    private readonly factoryManager?: SeederFactoryManager,
    private howMuchUsers: number = 10,
  ) {}

  // To local development — use faker with factoryManager
  async run(): Promise<{ admin: UserORM; users: UserORM[] }> {
    if (!this.factoryManager) throw new Error('FactoryManager is required to run seeders');

    const userRepository = this.dataSource.getRepository(UserORM);
    const userFactory = this.factoryManager.get(UserORM);

    return {
      admin: await userRepository.save(this.buildFromConstants(userRepository, SEEDED_ADMIN)),
      users: await userFactory.saveMany(this.howMuchUsers),
    };
  }

  // For tests e2e — datos fijos y predecibles, sin faker
  async runTestSeeders(): Promise<UserORM[]> {
    const userRepository = this.dataSource.getRepository(UserORM);

    return userRepository.save([
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
